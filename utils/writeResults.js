const fs = require("fs");
const _ = require("lodash");

const addRow = require("./addRow");

const getServerMessages = (resultArray) => {
  const driverChunks = _.chunk(resultArray, 4);

  let posCount = 1;
  const msgArray = driverChunks.map((chunk) => {
    let msg = "/message ";
    chunk.forEach((drv) => {
      msg = msg.concat(`${posCount}: ${drv[0]} | `);
      posCount++;
    });
    return msg.slice(0, msg.length - 3).concat("\n");
  });
  return msgArray;
};

const writeResults = (resultArray, resultFile, mode) => {
  // Write to file
  resultArray.forEach((result) => {
    const row = result.join("\t").concat("\n");

    fs.appendFileSync(resultFile, row, (err) => {
      if (err) {
        return console.log(err);
      }
    });
  });

  // Add an empty row after the results
  addRow(resultFile, "\n");

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
    addRow(resultFile, "\n");
  }

  // Add an empty row after the results to make separation between races
  // Only needed in regular quali
  if (mode !== 1) {
    addRow(resultFile, "=====\n\n");
  }
};

module.exports = writeResults;
