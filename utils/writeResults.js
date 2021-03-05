const fs = require("fs");
const _ = require("lodash");

const addEmptyRow = (resultFile) => {
  // Add an empty row after the results
  fs.appendFileSync(resultFile, "\n", (err) => {
    if (err) {
      return console.log(err);
    }
  });
};

const getServerMessages = (resultArray) => {
  const driverChunks = _.chunk(resultArray, 4);

  let posCount = 1;
  const msgArray = driverChunks.map((chunk) => {
    let msg = "/message ";
    chunk.forEach((drv) => {
      msg = msg.concat(`${posCount}: ${drv.field1} | `);
      posCount++;
    });
    return msg.slice(0, msg.length - 3).concat("\n");
  });
  return msgArray;
};

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
  addEmptyRow(resultFile);

  if (mode === 1) {
    // Write server messages
    const messages = getServerMessages(resultArray);
    messages.forEach((msg) => {
      fs.appendFileSync(resultFile, msg, (err) => {
        if (err) {
          return console.log(err);
        }
      });
    });

    // Add an empty row after the results
    addEmptyRow(resultFile);
  }
};

module.exports = writeResults;
