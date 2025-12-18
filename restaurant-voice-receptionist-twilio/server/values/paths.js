import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const valuesDir = path.resolve(__dirname);

const filePaths = {
  questions: path.join(valuesDir, "questions.json"),
  values: path.join(valuesDir, "values.json"),
  context: path.join(valuesDir, "restaurant_context.txt"),
  audio_save_path: path.join(valuesDir, "../responseAudio"),
};

if (!fs.existsSync(filePaths.audio_save_path)) {
  fs.mkdirSync(filePaths.audio_save_path, { recursive: true });
}

export default filePaths;
