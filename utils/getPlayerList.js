const fs = require("fs");

const getPlayerList = (fileName) => {
  const list = fs.readFileSync(fileName, "utf8");
  return list.split("\n");
};

module.exports = getPlayerList;
