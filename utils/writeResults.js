const fs = require("fs");

const writeResults = (resultArray, resultFile) => {
  // Write to file
  resultArray.forEach((result) => {
    const row = `${result.field1}\t${result.field2}\n`;
    process.stdout.write(row);

    fs.appendFileSync(resultFile, row, (err) => {
      if (err) {
        return console.log(err);
      }
    });
  });

  // Add an empty row after the results
  fs.appendFileSync(resultFile, "\n", (err) => {
    if (err) {
      return console.log(err);
    }
  });
};

module.exports = writeResults;
