import {
  compareMigrationValues,
  getMigrationValues,
  overwriteValues,
} from "./utils/migration.js";

const performMigration = async () => {
  console.log("Performing migration\n\n");
  const updatedValues = await getMigrationValues();

  const { error, changed } = await compareMigrationValues(updatedValues);

  console.log("\n");

  if (error) {
    console.error("Migration failed");
    process.exit(1);
  }

  if (changed == 0) {
    console.log("No changes found");
    process.exit(0);
  }

  console.log("Changed values were found..Proceed to overwrite?");

  process.stdin.setEncoding("utf8");
  process.stdin.on("data", async function (text) {
    const textString = text.toString().toLowerCase();
    if (textString && textString.length && textString[0] === "y") {
      console.log("Proceeding to overwrite");
      await overwriteValues(updatedValues);
      process.stdin.pause();
    } else {
      console.log("Migration cancelled");
      process.exit(1);
    }
  });
};

performMigration();
