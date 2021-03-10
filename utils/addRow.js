const fs = require("fs");

const addRow = (resultFile, content) => {
  // Add an empty row after the results
  fs.appendFileSync(resultFile, content, (err) => {
    if (err) {
      return console.log(err);
    }
  });
};

module.exports = addRow;
