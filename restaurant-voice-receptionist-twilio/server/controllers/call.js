import { replacePlaceholders } from "../utils/replacePlaceholders.js";
import filePaths from "../values/paths.js";
import { dbUtils } from "../utils/db.js";
import OpenAI from "openai/index.mjs";
import { db } from "../firebase.js";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const getTools = () => {
  const forwardTool = {
    type: "function",
    name: "forward_call",
    description:
      "Call this function when you need to forward call to a human. The first argument (forwardReason) must be the reason for forwarding the call. Use the following options: talk_to_human, order_issue, unmatched_question. If the reason doesn't fit into any of these categories, use the 'Other' option and pass the optional second argument with a suitable reason. Leave the second argument null if the reason fits into one of the predefined categories.",
    parameters: {
      type: "object",
      properties: {
        forwardReason: { type: "string" }, //[talk_to_human, order_issue, unmatched_question]
        otherReason: { type: "string" },
      },
      required: ["forwardReason"],
    },
  };

  const sendSmsTool = {
    type: "function",
    name: "send_sms",
    description: `Call this function when you need to send the caller a SMS. The argument (smsText) must be the full text of SMS (full link to send).`,
    parameters: {
      type: "object",
      properties: {
        smsText: { type: "string" },
      },
      required: ["smsText"],
    },
  };

  return [forwardTool, sendSmsTool];
};

const getAnalyticsData = async (transcript) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Use the transcript provided in a JSON format and return an object with 2 things. First is an array of covered topics as 'topics' in JSON format. Second is a 'sms' array in format { type, smsText: (The link/content that was sent), offered: (true if an offer was made to send an sms), sent: (true if an sms was sent) } where type can be "Website/URL"," Address/Maps", "Other". Only put an item in this array if either offered or sent is true. The topics must be one of: Reservations, Address, Pickup, Delivery, Catering, Dietary. If the question doesn't fit into any of these categories, pass a suitable topic. The final output should be such that it should be a JSON String as a text and should be directly parse-able via JSON.parse (No extra whitespaces or json modifiers should be present)`,
        },
        {
          role: "user",
          content: `Transcript: ${JSON.stringify(transcript)}`,
        },
      ],
      temperature: 0.7,
    });

    const { topics, sms } = JSON.parse(response.choices[0].message.content);

    return { topicsCovered: topics, sms };
  } catch (error) {
    console.error("Error fetching completion:", error);
    return { topicsCovered: [], sms: [] };
  }
};

export const callController = {
  sendSessionUpdate: (openAiWs) => {
    const sessionUpdate = {
      type: "session.update",
      session: {
        turn_detection: {
          type: "server_vad",
          threshold: 0.7,
          silence_duration_ms: 650,
        },
        input_audio_format: "g711_ulaw",
        output_audio_format: "g711_ulaw",
        voice: "sage",
        instructions: replacePlaceholders(filePaths.context),
        modalities: ["text", "audio"],
        temperature: 0.8,
        tools: getTools(),
        tool_choice: "auto",
      },
    };

    //   console.log("Sending session update:", JSON.stringify(sessionUpdate));
    openAiWs.send(JSON.stringify(sessionUpdate));
  },

  sendGreeting: async (openAiWs) => {
    const greetingData = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Greet the customer in a friendly tone as per your instructions. Keep your wording close to what is specified in the instructions.`,
          },
        ],
      },
    };

    openAiWs.send(JSON.stringify(greetingData));
    openAiWs.send(JSON.stringify({ type: "response.create" }));
  },

  forwardCall: async (sid) => {
    try {
      await twilioClient.calls(sid).update({
        twiml: `<Response><Say>Forwarding your call</Say><Pause length="2"/><Dial>${process.env.FORWARD_PHONE_NUMBER}</Dial></Response>`,
      });
    } catch (error) {
      console.error("Error forwarding call:", error);
    }
  },

  handleError: async (sid) => {
    try {
      await twilioClient.calls(sid).update({
        twiml: `<Response><Say>Sorry, we're experiencing some technical issues. Please try again later</Say><Pause length="3"/></Response>`,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  },

  endCall: async (sid) => {
    try {
      await twilioClient.calls(sid).update({ status: "completed" });
    } catch (error) {
      console.error("Error ending call:", error);
    }
  },

  sendSms: async (phoneNumber, messageText) => {
    try {
      await twilioClient.messages.create({
        body: messageText,
        from: process.env.TWILIO_SMS_NUMBER,
        to: phoneNumber,
      });
    } catch (error) {
      console.error("Error sending SMS:", error);
    }
  },

  handleRecordCall: async (sid) => {
    console.log("Recording call:", sid);
    try {
      await twilioClient.calls(sid).recordings.create();
    } catch (error) {
      console.error("Error recording call:", error);
    }
  },

  handleCallEnd: async (data, transcript) => {
    console.log(`Call ${data.callSID} ended`);
    try {
      data.startTime = dbUtils.toDBTimestamp(data.startTime);
      data.endTime = dbUtils.toDBTimestamp(new Date().toISOString());
      data.date = dbUtils.toDBTimestamp(
        new Date().toISOString().split("T")[0] + "T00:00:00Z"
      );
      data.duration = Math.floor(
        data.endTime._seconds - data.startTime._seconds
      );

      const { topicsCovered, sms } = await getAnalyticsData(transcript);

      data.topicsCovered = topicsCovered;
      data.sms = sms;

      db.collection("calls").doc(data.callSID).set(data);

      const prevCallers = await db.collection("callers").doc("callers").get();
      const prevCallersData = prevCallers.data();
      const callers = prevCallersData.callers;
      const existingCallerIndex = callers.findIndex(
        (caller) => caller.callerNumber === data.callerNumber
      );

      if (existingCallerIndex !== -1) {
        callers[existingCallerIndex].totalCalls++;
        callers[existingCallerIndex].latestCall = data.startTime;
        callers[existingCallerIndex].latestCallId = data.callSID;
      } else {
        callers.push({
          totalCalls: 1,
          latestCall: data.startTime,
          latestCallId: data.callSID,
          callerNumber: data.callerNumber,
        });
      }

      await db.collection("callers").doc("callers").set({ callers });
    } catch (error) {
      console.error("Error handling call end:", error);
    }
  },
};
