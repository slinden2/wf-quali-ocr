const path = require("path");
const fs = require("fs");
const getScreenshots = require("./getScreenshots");

const clearScreenshots = (screenshotDir, backupDir) => {
  const screenshots = getScreenshots(screenshotDir);
  for (const f of screenshots) {
    try {
      if (!fs.existsSync(path.join(screenshotDir, backupDir))) {
        fs.mkdirSync(path.join(screenshotDir, backupDir));
      }
      fs.renameSync(
        path.join(screenshotDir, f),
        path.join(screenshotDir, backupDir, f)
      );
    } catch (err) {
      console.log(err);
    }
  }
};

module.exports = clearScreenshots;
