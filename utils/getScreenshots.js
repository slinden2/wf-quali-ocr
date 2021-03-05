const fs = require("fs");
const path = require("path");

const getScreenshots = (screenshotDir) => {
  return fs
    .readdirSync(screenshotDir)
    .filter((sh) => !fs.lstatSync(path.join(screenshotDir, sh)).isDirectory());
};

module.exports = getScreenshots;
