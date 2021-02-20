const path = require("path");
const fs = require("fs");

const clearOutputFiles = (outputDir) => {
  const outputFiles = fs.readdirSync(outputDir);
  for (const f of outputFiles) {
    try {
      fs.unlinkSync(path.join(outputDir, f));
    } catch (err) {
      console.log(err);
    }
  }
};

module.exports = clearOutputFiles;
