const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const main = require(".");

console.log("1=quali 2=race 3=race w/ points 4=event 5=player list");
readline.question("Please select one of the above options: ", (mode) => {
  console.log("Getting results...");
  main(mode)
    .then(() => {
      console.log("Done. The results are saved in a file.");
      setTimeout(() => {
        process.exit(0);
      }, 5000);
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
});
