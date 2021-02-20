const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const main = require(".");

console.log("1=quali 2=race");
readline.question("Please select one of the above options: ", (mode) => {
  console.log("Getting results...");
  main(mode)
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
});