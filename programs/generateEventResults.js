const fs = require("fs");

const getKey = require("../utils/getKey");
const addRow = require("../utils/addRow");

const generateRaceResults = (resultFile, eventResultFile) => {
  // Get results from results file.
  const rawResArrays = fs
    .readFileSync(resultFile, "utf-8")
    .split("=====")
    .map((race) =>
      race
        .split("\n\n")
        .filter((e) => e.length && !e.startsWith("/message"))
        .map((e) => {
          return e.split("\n").map((driver) => {
            if (driver.includes("\t")) {
              const [name, par] = driver.split("\t");
              if (par.includes(":")) {
                // return only name for quali rows
                return [name];
              } else {
                // return an array of name and points for race results
                return [name, Number(par)];
              }
            }
            return driver;
          });
        })
    )
    .filter((event) => event.length);

  // Combine quali and race results
  const resObj = {};
  rawResArrays.forEach((event, raceNum) => {
    resObj[raceNum] = {};
    event.forEach((partResults) => {
      partResults.forEach((driver, i) => {
        // check if driver key is in resObj and if not, initialize it
        let key = getKey(resObj[raceNum], driver[0]);
        if (!key) {
          resObj[raceNum][driver[0]] = {};
          key = driver[0];
        }

        resObj[raceNum][key].raceNum = raceNum + 1;

        if (driver.length === 1) {
          // quali
          // driver is in ["name"] format
          resObj[raceNum][key].quali = i + 1;
        } else if (driver.length === 2) {
          // race
          // driver is in ["name", "points"] format
          resObj[raceNum][key].race = i + 1;
          resObj[raceNum][key].points = driver[1];
        } else {
          throw new Error(
            `Error in combining quali and race results. Incorrect driver.length: ${driver.length}`
          );
        }
      });
    });
  });

  // Transform objects into arrays
  const resArr = [];
  for (const [i, results] of Object.entries(resObj)) {
    resArr.push(results);
  }

  // Group events by driver
  const final = resArr.reduce((acc, cur, i) => {
    Object.entries(cur).map(([key, res]) => {
      const foundKey = getKey(acc, key);

      if (foundKey) {
        acc[foundKey].push(res);
      } else {
        acc[key] = [];
        acc[key].push(res);
      }
    });

    return acc;
  }, {});

  // Count total points and sort
  const finalResultArr = Object.entries(final)
    .map(([name, races]) => {
      const totalPoints = races.reduce((acc, cur) => {
        // If player is not present in the final screenshot give 0 points
        acc += cur.points ? cur.points : 0;
        return acc;
      }, 0);
      return { name, races, totalPoints };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);

  // Prepare result header row (most likely to have driven all qualis and races)
  const winner = finalResultArr[0];
  const hasQuali = !!winner.races[0].quali;
  const numOfRaces = winner.races[winner.races.length - 1].raceNum;
  const raceHeaders = new Array(winner.races.length)
    .fill("")
    .map((_, i) => {
      return hasQuali ? `q${i + 1}\tr${i + 1}` : `r${i + 1}`;
    })
    .join("\t");
  const headerString = `name\t${raceHeaders}\tpoints\n`;

  // write headers
  fs.appendFileSync(eventResultFile, headerString, (err) => {
    if (err) {
      return console.log(err);
    }
  });

  // Prepare driver string and write them in the result file
  finalResultArr.forEach((driver) => {
    let raceCounter = 1;

    // Create result strings
    const results = driver.races
      .map((race) => {
        // Check if a driver has missed both quali and race of a race and
        // fill with NA
        let missedRaceStr = "";
        if (raceCounter < race.raceNum) {
          const numOfMissedRaces = race.raceNum - raceCounter;
          const naStr = hasQuali ? "NA\tNA\t" : "NA\t";
          missedRaceStr = naStr.repeat(numOfMissedRaces);
          raceCounter = race.raceNum;
        }
        raceCounter++;

        // Check if a driver has missed quali OR race and fill with NA
        const racePos = race.race ? race.race : "NA";
        const resStr = hasQuali
          ? race.quali
            ? `${race.quali}\t${racePos}`
            : `NA\t${racePos}`
          : racePos;
        return `${missedRaceStr}${resStr}`;
      })
      .join("\t");

    // Add fill rows with NA if races missing from the end of the event
    // This is useful if somebody quits and doesnt drive all races.
    const finalResults = results.split("\n").map((r) => {
      const fullResultLength = hasQuali ? numOfRaces * 2 : numOfRaces;
      if (r.split("\t").length < fullResultLength) {
        const arr = r.split("\t");
        while (arr.length < fullResultLength) {
          arr.push("NA");
        }
        return arr.join("\t");
      }

      return r;
    });

    // write result rows
    fs.appendFileSync(
      eventResultFile,
      `${driver.name}\t${finalResults}\t${driver.totalPoints}\n`,
      (err) => {
        if (err) {
          return console.log(err);
        }
      }
    );
  });
  addRow(eventResultFile, "\n");
};

module.exports = generateRaceResults;
