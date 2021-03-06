const fs = require("fs");

const stringSimilarity = require("../utils/stringSimilarity");

const generateRaceResults = async (resultFile, eventResultFile) => {
  // Get results from results file.
  const rawResArrays = fs
    .readFileSync(resultFile, "utf-8")
    .split("=====")
    .map((race) =>
      race
        .split("\n\n")
        .filter((e) => e.length && !e.startsWith("/message"))
        .map((e) => {
          return e.split("\n").map((driver, i) => {
            if (driver.includes("\t")) {
              const [name, par] = driver.split("\t");
              if (par.includes(":")) {
                return name;
              } else {
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
    event.forEach((partResults, phaseNum) => {
      if (phaseNum === 0) {
        // quali
        partResults.forEach((driver, i) => {
          if (!resObj[raceNum][driver]) resObj[raceNum][driver] = {};
          resObj[raceNum][driver].quali = i + 1;
        });
      } else {
        // race
        partResults.forEach((driver, i) => {
          // driver is in [driverName, points] format
          const definedKeys = Object.keys(resObj[raceNum]);
          let key = definedKeys.find((key) => key === driver[0]);
          if (!key) {
            definedKeys.forEach((k) => {
              const similarity = stringSimilarity(k, driver[0]);
              if (similarity > 0.5) {
                key = k;
              }
            });
          }
          if (key) {
            resObj[raceNum][key].race = i + 1;
            resObj[raceNum][key].points = driver[1];
          }
        });
      }
    });
  });

  // Transform objects into arrays
  const resArr = [];
  for (const [i, results] of Object.entries(resObj)) {
    resArr.push(results);
  }

  // Group events by driver
  const final = resArr.reduce((acc, cur, i) => {
    const definedKeys = Object.keys(acc);
    Object.entries(cur).map(([key, res]) => {
      let foundKey = definedKeys.find((k) => k === key);

      if (!foundKey) {
        definedKeys.forEach((k) => {
          const similarity = stringSimilarity(k, key);

          if (similarity > 0.5) {
            foundKey = k;
          }
        });
      }

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
  const finalResulArr = Object.entries(final)
    .map((res) => {
      const driverPoints = res[1].reduce((acc, cur) => {
        acc += cur.points;
        return acc;
      }, 0);
      return [res[0], ...res[1], driverPoints];
    })
    .sort((a, b) => b[4] - a[4]);

  // Prepare driver string and write them in the result file
  finalResulArr.forEach((driver) => {
    const name = driver.splice(0, 1)[0];
    const points = driver.splice(driver.length - 1)[0];
    const results = driver
      .map((race) => {
        return `${race.quali}\t${race.race}`;
      })
      .join("\t");

    fs.appendFileSync(
      eventResultFile,
      `${name}\t${results}\t${points}\n`,
      (err) => {
        if (err) {
          return console.log(err);
        }
      }
    );
  });
};

module.exports = generateRaceResults;
