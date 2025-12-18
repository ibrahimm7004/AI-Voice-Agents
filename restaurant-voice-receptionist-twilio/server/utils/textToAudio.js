import OpenAI from "openai/index.mjs";
import filePaths from "../values/paths.js";
import path from "path";
import fs from "fs";

export const textToAudio = async (text) => {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const filename = "preview.mp3";

    const filePath = path.join(filePaths.audio_save_path, filename);

    const response = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "nova",
      input: text,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.promises.writeFile(filePath, buffer);

    return fs.readFileSync(filePath);
  } catch (error) {
    console.error("An error occurred:", error);
    return null;
  }
};
