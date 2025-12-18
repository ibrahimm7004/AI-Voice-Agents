import filePaths from "../values/paths.js";
import fs from "fs";

export const migrationController = {
  getCurrentValues: async (req, reply) => {
    const valuesDataRaw = await fs.promises.readFile(filePaths.values, "utf-8");
    const valuesData = JSON.parse(valuesDataRaw);
    const questionsDataRaw = await fs.promises.readFile(
      filePaths.questions,
      "utf-8"
    );
    const questionsData = JSON.parse(questionsDataRaw);
    return reply.code(200).send({
      values: valuesData,
      questions: questionsData,
    });
  },
};
