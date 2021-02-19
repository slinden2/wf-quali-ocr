const getQualiResults = require(".");
console.log("Getting results...");
getQualiResults()
  .then(() => {
    console.log("Done. The results can be found in the results.txt file.");
    setTimeout(() => {
      process.exit(0);
    }, 5000);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
