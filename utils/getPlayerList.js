const fs = require("fs");

const getPlayerList = (fileName) => {
  if (fs.existsSync(fileName)) {
    const raw = fs.readFileSync(fileName, "utf8");
    const list = raw.split("\r\n").join("\n");
    return list.split("\n").filter((name) => name);
  } else {
    return [];
  }
};

module.exports = getPlayerList;
