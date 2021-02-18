const fs = require("fs");

module.exports = () => {
  try {
    return fs.readFileSync("api_key.txt", "utf8");
  } catch (err) {
    console.error(err);
  }
};
