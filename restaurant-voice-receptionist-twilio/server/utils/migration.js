import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";

import filePaths from "../values/paths.js";

dotenv.config();

export const getMigrationValues = async () => {
  const backendUrl = process.env.BACKEND_URL;
  const response = await axios.get(`${backendUrl}/migration`);
  const { values, questions } = response.data;

  return { values, questions };
};

export const compareMigrationValues = async ({
  values: newValues,
  questions: newQuestions,
}) => {
  const result = { changed: 0, error: false };

  try {
    const currentValuesRaw = await fs.promises.readFile(
      filePaths.values,
      "utf-8"
    );
    const currentValues = JSON.parse(currentValuesRaw);

    for (const key in currentValues) {
      if (!newValues[key]) {
        console.error(`[VALUE MISSING]\t\t${key}`);
        return { error: true };
      } else if (
        ["operatingHours", "parkingOptions", "accessibilityOptions"].includes(
          key
        )
      ) {
        continue;
      } else if (newValues[key] !== currentValues[key]) {
        console.log(
          `[VALUE CHANGED]\t\t${key}\t\t${newValues[key]} -> ${currentValues[key]}`
        );
        result.changed++;
      }
    }

    const currentQuestionsRaw = await fs.promises.readFile(
      filePaths.questions,
      "utf-8"
    );
    const currentQuestions = JSON.parse(currentQuestionsRaw);

    for (let q = 0; q < currentQuestions.length; q++) {
      const currentQuestion = currentQuestions[q];

      if (newQuestions.findIndex((q) => q.id === currentQuestion.id) === -1) {
        console.error(`[QUESTION MISSING]\t\t${currentQuestion}`);
        return { error: true };
      }

      for (const key in currentQuestion) {
        if (Array.isArray(currentQuestion[key])) {
          for (let sq = 0; sq < currentQuestion[key].length; sq++) {
            if (typeof currentQuestion[key][sq] === "string") {
              if (currentQuestions[q][key][sq] !== newQuestions[q][key][sq]) {
                console.log(
                  `[QUESTION CHANGED]\t\t${key}\t\t${currentQuestions[q][key][sq]} -> ${newQuestions[q][key][sq]}`
                );
                result.changed++;
              }
            } else {
              for (const item in currentQuestion[key][sq]) {
                if (
                  typeof currentQuestion[key][sq][item] === "string" &&
                  currentQuestion[key][sq][item].includes("{{") &&
                  currentQuestion[key][sq][item] !==
                    newQuestions[q][key][sq][item]
                ) {
                  console.error(
                    `[LINK CHANGED]\t\t\t${item}\t\t${currentQuestions[q][key][sq][item]} -> ${newQuestions[q][key][sq][item]}`
                  );
                  return { error: true };
                }

                if (
                  currentQuestion[key][sq][item] !==
                  newQuestions[q][key][sq][item]
                ) {
                  //   console.log(q, key, sq, item);
                  console.log(
                    `[QUESTION CHANGED]\t\t${q}.${
                      Object.keys(currentQuestion[key][sq])[0]
                    }.${item}\t\t${currentQuestions[q][key][sq][item]} -> ${
                      newQuestions[q][key][sq][item]
                    }`
                  );
                  result.changed++;
                }
              }
            }
          }
        } else if (typeof currentQuestion[key] === "string") {
          if (
            typeof currentQuestion[key] === "string" &&
            ["type", "base", "end", "link", "label", "prompt"].includes(key) &&
            currentQuestion[key] !== newQuestions[q][key]
          ) {
            console.error(
              `[FIXED VALUE CHANGED]\t\t\t${key}\t\t${currentQuestions[q][key]} -> ${newQuestions[q][key]}`
            );
            return { error: true };
          }

          if (
            typeof currentQuestion[key] === "string" &&
            currentQuestion[key] !== newQuestions[q][key]
          ) {
            console.log(
              `[QUESTION CHANGED]\t\t\t${key}\t\t${currentQuestions[q][key]} -> ${newQuestions[q][key]}`
            );
            result.changed++;
          }
        }
      }
    }

    return result;
  } catch (error) {
    console.error(error);
    return { error: true };
  }
};

export const overwriteValues = async ({
  values: newValues,
  questions: newQuestions,
}) => {
  console.log("Overwriting values");

  await fs.promises.writeFile(
    filePaths.questions,
    JSON.stringify(newQuestions, null, 2)
  );

  await fs.promises.writeFile(
    filePaths.values,
    JSON.stringify(newValues, null, 2)
  );
};
