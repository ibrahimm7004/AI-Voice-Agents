const fs = require("fs");
const dotenv = require("dotenv");

if (!fs.existsSync("client/.env")) {
  console.error(`Error setting env variables: MISSING FILE client/.env`);
  process.exit(1);
}

const clientEnvConfig = dotenv.parse(fs.readFileSync("client/.env"));
console.log(clientEnvConfig);
console.log("Backend URL to be used:", clientEnvConfig.VITE_BACKEND_URL);
console.log();

console.log(
  "Please confirm that the above environment variables are correct before proceeding:(Y/n)"
);
process.stdin.setEncoding("utf8");
process.stdin.on("data", function (text) {
  const textString = text.toString().toLowerCase();
  if (textString && textString.length && textString[0] === "y") {
    console.log("Proceeding to build");
    process.stdin.pause();
  } else {
    console.log("Exiting");
    process.exit(1);
  }
});
