const fs = require("fs");

const getResultsFromFile = (resultFile) => {
  return fs
    .readFileSync(resultFile, "utf-8")
    .split("\n\n=====\n\n")
    .map((race) =>
      race
        .split("\n")
        .filter((row) => row.length && !row.startsWith("/message"))
        .map((driver) => driver.split("\t"))
    )
    .filter((event) => event.length);
};

module.exports = getResultsFromFile;
