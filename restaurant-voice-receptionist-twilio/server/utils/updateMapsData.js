import filePaths from "../values/paths.js";
import axios from "axios";
import fs from "fs";

const objToString = (obj) => {
  return Object.entries(obj)
    .filter(([__, value]) => value)
    .map(([key]) =>
      key.replace(/([A-Z])/g, " $1").replace(/^\w/, (c) => c.toUpperCase())
    )
    .join(", ");
};

export const updateMapsData = async () => {
  try {
    const valuesData = JSON.parse(fs.readFileSync(filePaths.values, "utf8"));

    const fields = [
      "currentOpeningHours",
      "parkingOptions",
      "accessibilityOptions",
    ];

    const placeId = valuesData.placeId;
    const url = `https://places.googleapis.com/v1/places/${placeId}`;
    const params = {
      fields: fields.join(","),
      key: process.env.GOOGLE_PLACES_API_KEY,
    };

    const response = await axios.get(url, { params });
    const operatingHours =
      response.data.currentOpeningHours.weekdayDescriptions;
    const { parkingOptions, accessibilityOptions } = response.data;

    valuesData.operatingHours = operatingHours;
    valuesData.parkingOptions = objToString(parkingOptions);
    valuesData.accessibilityOptions = objToString(accessibilityOptions);

    fs.writeFileSync(filePaths.values, JSON.stringify(valuesData, null, 2));

    console.log("Maps data updated successfully");
  } catch (error) {
    console.error("Error fetching map data:", error.message);
    return null;
  }
};

export const checkMapsData = () => {
  const valuesData = JSON.parse(fs.readFileSync(filePaths.values, "utf8"));
  if (
    !valuesData.operatingHours ||
    !valuesData.parkingOptions ||
    !valuesData.accessibilityOptions
  ) {
    console.log("Updating maps data...");
    updateMapsData();
  }
};
