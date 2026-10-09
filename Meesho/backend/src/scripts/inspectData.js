const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "../data/meeshoData.json"
);

function inspectData() {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(content);
    console.log("Dataset keys:", Object.keys(data));
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        console.log(`\n${key}: ${value.length} records`);

        if (value.length > 0) {
          console.log("First record fields:", Object.keys(value[0]));
          console.log("First record:", value[0]);
        }
      } else {
        console.log(`\n${key}:`, typeof value);
      }
    }
  } catch (error) {
    console.error("Inspection failed:", error.message);
  }
}
inspectData();