import {
  camelCaseToTitleCase,
  snakeToTitleCase,
  stringToParagraphs,
  toSentenceCase,
} from "./string";
import { Question } from "../types/questions";
import {
  faBowlFood,
  faCalendar,
  faCar,
  faGear,
  faHand,
  faLeaf,
  faPerson,
  faTruckRampBox,
  faUtensils,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

export const getTitle = (question: Question): string => {
  if (question.type == "reservations") {
    return question.label;
  }

  if (question.type === "address") {
    if (question.prompts) {
      return question.prompts.join(", ").replace(/\?/g, "");
    } else {
      return "Your Address";
    }
  }

  if (question.type === "other") {
    return question.prompts.join(", ");
  }

  if (question.type === "value") {
    return camelCaseToTitleCase(question.label);
  }

  return snakeToTitleCase(question.type);
};

export const getSubtitle = (question: Question): string => {
  if (question.type === "greeting") {
    return question.tagline;
  }

  if (
    question.type === "reservations" ||
    question.type === "pickup" ||
    question.type === "delivery" ||
    question.type === "catering" ||
    question.type === "dietary_accommodations"
  ) {
    return question.response ? "Available" : "Not Available";
  }

  if (question.type === "address") {
    if (question.prompts) {
      return "We'll use your google maps link to provide information";
    } else {
      return question.response!;
    }
  }

  if (question.type === "other") {
    return toSentenceCase(question.response);
  }

  if (question.type === "value") {
    return question.value;
  }

  return "-";
};

export const getIcon = (title: string): IconDefinition => {
  switch (title) {
    case "Greeting":
      return faHand;
    case "Reservations":
      return faCalendar;
    case "Private Dining":
      return faUtensils;
    case "Pickup":
      return faCar;
    case "Delivery":
      return faTruckRampBox;
    case "Catering":
      return faBowlFood;
    case "Dietary Accommodations":
      return faLeaf;
    case "Value":
      return faGear;
    default:
      return faPerson;
  }
};

export const getPreviewText = (
  question: Question
): { string: string; paragraphs: JSX.Element[] } => {
  let res = null;

  switch (question.type) {
    case "greeting":
      res = `${question.base}\n${
        question.add_tagline ? question.tagline : ""
      }\n${question.end}`;
      break;
    case "reservations":
      res = `${question.response ? "Yes" : "No"}, we do ${
        question.response ? "" : "not "
      }${
        question.label === "Private Dining"
          ? "offer private dining."
          : "accept reservations."
      }`;
      break;
    case "address":
      res = question.prompt ? question.response! : "";
      break;
    case "pickup":
      res = `${question.response ? "Yes" : "No"}, we ${
        question.response ? "" : "do not "
      }offer pickup${
        !question.response
          ? "."
          : ` ${question.methods
              .filter((method) => method.available)
              .map((method) => method.method)
              .join(" & ")}.`
      }`;
      break;
    case "delivery":
      res = `${question.response ? "Yes" : "No"}, we ${
        question.response ? "" : "do not "
      }offer delivery${
        !question.response
          ? "."
          : ` ${question.methods
              .filter((method) => method.available)
              .map((method) => method.method)
              .join(" & ")}.`
      }`;
      break;
    case "catering":
      res = `${question.response ? "Yes" : "No"}, we ${
        question.response ? "" : "do not "
      }offer catering${
        !question.response
          ? "."
          : ` ${question.methods
              .filter((method) => method.available)
              .map((method) => method.method)
              .join(" & ")}.`
      }`;
      break;

    case "dietary_accommodations":
      res = `${question.response ? "Yes" : "No"}, we ${
        question.response ? "" : "do not "
      }offer dietary accommodations${
        !question.response
          ? "."
          : ` including ${question.methods
              .filter((method) => method.available)
              .map((method) => method.method)
              .join(" & ")}.`
      }`;
      break;
    default:
      res = "pending";
  }
  return { string: res, paragraphs: stringToParagraphs(res) };
};
