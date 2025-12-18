import { replacePlaceholders } from "../utils/replacePlaceholders.js";
import { textToAudio } from "../utils/textToAudio.js";
import filePaths from "../values/paths.js";
import fs from "fs";

const containsPlaceholder = (value) => {
  if (typeof value === "string") {
    const regex = /\{\{.*?\}\}/;
    return regex.test(value);
  }
  return false;
};

export const questionsController = {
  getQuestionCategories: async (req, reply) => {
    try {
      const questions = replacePlaceholders(filePaths.questions);
      const valuesData = JSON.parse(fs.readFileSync(filePaths.values, "utf8"));

      const fields = ["name", "websiteLink", "emailLink", "dietaryMenuLink"];

      let baseQuestionsLength = questions.length;

      for (const key in valuesData) {
        if (fields.includes(key)) {
          questions.push({
            id: ++baseQuestionsLength,
            type: "value",
            label: key,
            value: valuesData[key],
          });
        }
      }

      reply.send(questions);
    } catch (error) {
      console.error("An error occurred:", error);
      reply.code(500).send({ error: "An error occurred" });
    }
  },

  previewResponse: async (req, reply) => {
    try {
      const { preview_text } = req.body;

      if (!preview_text) {
        return reply.code(400).send({ error: "No preview text provided" });
      }

      const audioBuffer = await textToAudio(preview_text);

      if (!audioBuffer) {
        return reply.code(500).send({ error: "Audio generation failed" });
      }

      reply
        .header("Content-Type", "audio/mp3")
        .header("Content-Disposition", 'attachment; filename="preview.mp3"')
        .status(200)
        .send(audioBuffer);
    } catch (error) {
      console.error(error);
      return reply.code(500).send({ error: "Couldn't preview response" });
    }
  },

  updateQuestion: async (req, reply) => {
    const questionId = parseInt(req.params.id);
    const data = req.body;

    try {
      if (data.updated.type == "value") {
        const valuesDataRaw = await fs.promises.readFile(
          filePaths.values,
          "utf-8"
        );
        const valuesData = JSON.parse(valuesDataRaw);

        valuesData[data.updated.label] = data.updated.value;

        await fs.promises.writeFile(
          filePaths.values,
          JSON.stringify(valuesData, null, 2)
        );

        return reply.code(200).send({ message: "Updated successfully" });
      } else {
        const fileData = await fs.promises.readFile(
          filePaths.questions,
          "utf-8"
        );
        let questions;
        try {
          questions = JSON.parse(fileData);
        } catch (parseError) {
          console.error(parseError);
          return reply.code(500).send({ error: "Error parsing JSON data" });
        }

        const questionToUpdate = questions.find((q) => q.id === questionId);

        if (!questionToUpdate) {
          return reply.code(404).send({ error: "Question not found" });
        }

        const updatedFields = data.updated;

        if (!updatedFields) {
          return reply.code(400).send({ error: "No update data provided" });
        }

        for (const [key, newValue] of Object.entries(updatedFields)) {
          if (key in questionToUpdate) {
            const currentValue = questionToUpdate[key];

            if (!containsPlaceholder(currentValue)) {
              questionToUpdate[key] = newValue;
            }
          }
        }

        await fs.promises.writeFile(
          filePaths.questions,
          JSON.stringify(questions, null, 2)
        );

        return reply.code(200).send({ message: "Updated successfully" });
      }
    } catch (error) {
      console.error(error);
      return reply.code(500).send({ error: error.message });
    }
  },
};
