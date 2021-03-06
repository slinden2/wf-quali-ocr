const fs = require("fs");

const getPointsObject = () => {
  return fs
    .readFileSync("points.txt", "utf8")
    .split("\r\n")
    .map((row) => row.split(" "))
    .reduce((acc, cur) => {
      acc[cur[0]] = cur[1];
      return acc;
    }, {});
};

module.exports = getPointsObject;
