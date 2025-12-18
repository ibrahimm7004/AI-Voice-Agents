import { callController } from "../controllers/call.js";
import WebSocket from "ws";

import dotenv from "dotenv";
dotenv.config();

const { OPENAI_API_KEY } = process.env;
if (!OPENAI_API_KEY) {
  console.error("Missing OpenAI API key. Please set it in the .env file.");
  process.exit(1);
}

const LOG_EVENT_TYPES = [
  "response.content.done",
  "rate_limits.updated",
  //   "response.done",
  "response.audio_transcript.delta",
  "response.audio_transcript.done",
  "response.audio.delta",
  "input_audio_buffer.committed",
  "input_audio_buffer.speech_stopped",
  "input_audio_buffer.speech_started",
  "session.created",
  "response.function_call_arguments.delta",
  "response.audio.done",
  "response.content_part.done",
];

async function callRoutes(fastify) {
  fastify.post("/incoming-call", async (req, reply) => {
    const { From: callerNumber, FromCountry: callerCountry } = req.body;

    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
                          <Response>
                              <Connect>
                                  <Stream url="wss://${req.headers.host}/media-stream">
                                        <Parameter name="callerNumber" value="${callerNumber}" />
                                        <Parameter name="callerCountry" value="${callerCountry}" />
                                  </Stream>
                              </Connect>
                          </Response>`;
    reply.type("text/xml").send(twimlResponse);
  });

  fastify.get("/media-stream", { websocket: true }, (connection, req) => {
    console.log("Client connected");

    const callData = {
      callSID: null,
      startTime: new Date().toISOString(),
      callerNumber: null,
      callerCountry: null,
      forwarded: {
        wasForwarded: false,
      },
      topicsCovered: [],
      otherTopicsCovered: [],
      sms: [],
    };
    let streamSid = null;
    const transcript = [];

    const handleFunctionCall = async (data) => {
      const args = JSON.parse(data.arguments);

      if (data.name == "forward_call") {
        console.log("forward_call", args);
        const { forwardReason, otherReason } = args;
        callData.forwarded = { wasForwarded: true, forwardReason, otherReason };
        callController.forwardCall(callData.callSID);
      } else if (data.name == "send_sms") {
        console.log("send_sms", args);
        const { smsText } = args;

        callController.sendSms(callData.callerNumber, smsText);

        openAiWs.send(
          JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "function_call_output",
              call_id: data.call_id,
              output: "SMS sent successfully",
            },
          })
        );

        openAiWs.send(JSON.stringify({ type: "response.create" }));
      }
    };

    const openAiWs = new WebSocket(
      "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview",
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "OpenAI-Beta": "realtime=v1",
        },
      }
    );

    openAiWs.on("open", () => {
      //   console.log("Connected to the OpenAI Realtime API");
      setTimeout(() => {
        callController.sendSessionUpdate(openAiWs);
      }, 250);
    });

    openAiWs.on("message", (data) => {
      try {
        const response = JSON.parse(data);

        if (LOG_EVENT_TYPES.includes(response.type)) {
          //   console.log(`Received event: ${response.type}`, response);
        } else {
          //   console.log("Received unhandled event:", response.type);
        }

        if (response.type == "error") {
          throw response;
        }

        if (response.type === "session.updated") {
          //   console.log("Session updated");
          callController.sendGreeting(openAiWs);
        }

        if (response.type == "response.function_call_arguments.done") {
          handleFunctionCall(response);
        }

        if (
          response.type === "response.output_item.done" &&
          response.item &&
          response.item.content &&
          response.item.content[0] &&
          response.item.content[0].transcript
        ) {
          transcript.push(response.item.content[0].transcript);
        }

        if (response.type === "response.audio.delta" && response.delta) {
          const audioDelta = {
            event: "media",
            streamSid: streamSid,
            media: {
              payload: Buffer.from(response.delta, "base64").toString("base64"),
            },
          };
          connection.send(JSON.stringify(audioDelta));
        }
      } catch (error) {
        console.log("Error processing OpenAI message:", error);
        callController.handleError(callData.callSID);
      }
    });

    connection.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        switch (data.event) {
          case "media":
            if (openAiWs.readyState === WebSocket.OPEN) {
              const audioAppend = {
                type: "input_audio_buffer.append",
                audio: data.media.payload,
              };
              openAiWs.send(JSON.stringify(audioAppend));
            }
            break;
          case "start":
            streamSid = data.start.streamSid;

            const { callerNumber, callerCountry } = data.start.customParameters;

            callData.callerNumber = callerNumber;
            callData.callerCountry = callerCountry;
            callData.callSID = data.start.callSid;

            if (process.env.K_SERVICE) {
              callController.handleRecordCall(data.start.callSid);
            }

            break;
          default:
            // console.log("Received non-media event:", data.event);
            break;
        }
      } catch (error) {
        console.log("Error parsing message:", error, "Message:", message);
      }
    });

    connection.on("close", () => {
      console.log("Client disconnected.");
      if (openAiWs.readyState === WebSocket.OPEN) openAiWs.close();

      callController.handleCallEnd(callData, transcript);
    });

    connection.on("error", (error) => {
      console.error("Error in the WebSocket connection:", error);
      callController.handleError(callData.callSID);
    });

    openAiWs.on("close", () => {
      //   console.log("Disconnected from the OpenAI Realtime API");
    });

    openAiWs.on("error", (error) => {
      console.error("Error in the OpenAI WebSocket:", error);
      callController.handleError(callData.callSID);
    });
  });
}

export default callRoutes;
