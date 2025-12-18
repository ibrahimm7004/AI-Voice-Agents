import filePaths from "../values/paths.js";
import path from "path";
import fs from "fs";

const addAdditionalInfo = () => {
  const values = JSON.parse(fs.readFileSync(filePaths.values, "utf-8"));
  const questions = JSON.parse(fs.readFileSync(filePaths.questions, "utf-8"));

  if (questions[0]["add_tagline"]) {
    values["tagline"] = questions[0]["tagline"];
  }
  values["greetingEnd"] = questions[0]["end"];

  values["reservations"] = `${questions[1]["response"]}`;
  values["privateDining"] = `${questions[2]["response"]}`;
  values["address"] = `${questions[3]["response"]}`;

  if (questions[5]["response"]) {
    let pickup = "Available";
    if (questions[5]["methods"][0]["available"]) {
      pickup += `\n   - Customers can order online through this link: ${values["websiteLink"]}`;
    }
    if (questions[5]["methods"][1]["available"]) {
      pickup += `\n   - Customers can also ask for their call to be forwarded to a human`;
    }
    values["pickup"] = pickup;
  } else {
    values["pickup"] = "Not Available";
  }

  if (questions[6]["response"]) {
    let delivery = "Available.";
    if (questions[6]["methods"][0]["available"]) {
      delivery += `\n   - Customers can order online through this link: ${values["websiteLink"]}`;
    }
    if (questions[6]["methods"][1]["available"]) {
      delivery += `\n   - Customers can also ask for their call to be forwarded to a human.`;
    }
    values["delivery"] = delivery;
  } else {
    values["delivery"] = "Not Available";
  }

  if (questions[7]["response"]) {
    let catering = "Available.";
    if (questions[7]["methods"][0]["available"]) {
      catering += `\n   - Customers can order online through this link: ${values["websiteLink"]}`;
    }
    if (questions[7]["methods"][1]["available"]) {
      catering += `\n   - Customers can call/email ${values["emailLink"]} for catering inquiries.`;
    }
    if (questions[7]["methods"][2]["available"]) {
      catering += `\n   - Customers can also ask for their call to be forwarded to a human.`;
    }
    values["catering"] = catering;
  } else {
    values["catering"] = "Not Available";
  }

  if (questions[8]["response"]) {
    let diet = "can be accommodated.\n   - Options include: ";

    const options = questions[8]["methods"]
      .filter((option) => option["available"])
      .map((option) => option["method"]);

    diet += `${options.join(
      ", "
    )}. Any other are unavailable\n   - The dietary menu is available here: ${
      values["dietaryMenuLink"]
    }`;
    values["diet"] = diet;
  } else {
    values["diet"] = "can not be accommodated.";
  }

  values["other"] = `If asked to ${questions[9]["prompts"].join(
    ", "
  )} use the forward function provided to forward the call`;

  return values;
};

export const replacePlaceholders = (inputFilePath) => {
  const isJson = path.extname(inputFilePath).toLowerCase() === ".json";

  if (!isJson) {
    const values = addAdditionalInfo();

    const content = fs.readFileSync(inputFilePath, "utf-8");
    const placeholders = content.match(/{{(.*?)}}/g) || [];

    let updatedContent = content;
    placeholders.forEach((placeholder) => {
      const key = placeholder.slice(2, -2);
      if (key in values) {
        updatedContent = updatedContent.replace(
          new RegExp(`{{${key}}}`, "g"),
          values[key]
        );
      }
    });

    return updatedContent;
  } else {
    const jsonData = JSON.parse(fs.readFileSync(inputFilePath, "utf-8"));
    const values = JSON.parse(fs.readFileSync(filePaths.values, "utf-8"));

    const replaceInJson = (data) => {
      if (typeof data === "object" && !Array.isArray(data)) {
        return Object.fromEntries(
          Object.entries(data).map(([key, value]) => [
            key,
            replaceInJson(value),
          ])
        );
      } else if (Array.isArray(data)) {
        return data.map(replaceInJson);
      } else if (typeof data === "string") {
        const placeholders = data.match(/{{(.*?)}}/g) || [];
        let updatedData = data;
        placeholders.forEach((placeholder) => {
          const key = placeholder.slice(2, -2);
          if (key in values) {
            updatedData = updatedData.replace(
              new RegExp(`{{${key}}}`, "g"),
              values[key]
            );
          }
        });
        return updatedData;
      } else {
        return data;
      }
    };

    return replaceInJson(jsonData);
  }
};
