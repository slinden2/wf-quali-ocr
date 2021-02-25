const fs = require("fs");

const writeResults = (resultArray, resultFile, mode) => {
  // Write to file
  resultArray.forEach((result) => {
    // Modes 1 and 3 have two fields, but mode 2 only one
    const row =
      mode === 2
        ? `${result.field1}\n`
        : `${result.field1}\t${result.field2}\n`;
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
