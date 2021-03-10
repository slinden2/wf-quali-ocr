const fs = require("fs");

const addRow = require("../utils/addRow");
const stringSimilarity = require("../utils/stringSimilarity");

const getKey = (inputObj, referenceKey) => {
  const definedKeys = Object.keys(inputObj);
  let key = definedKeys.find((key) => key === referenceKey);
  if (!key) {
    definedKeys.forEach((k) => {
      const similarity = stringSimilarity(k, referenceKey);
      if (similarity > 0.5) {
        key = k;
      }
    });
  }
  return key;
};

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

        if (driver.length === 1) {
          // quali
          // driver is in ["name"] format
          resObj[raceNum][driver[0]].quali = i + 1;
        } else if (driver.length === 2) {
          // race
          // driver is in ["name", "points"] format
          resObj[raceNum][key].race = i + 1;
          resObj[raceNum][key].points = driver[1];
        } else {
          throw new Error(
            `Error in comining quali and race results. Incorrect driver.length: ${driver.length}`
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
    .map((res) => {
      const driverPoints = res[1].reduce((acc, cur) => {
        acc += cur.points;
        return acc;
      }, 0);
      return [res[0], ...res[1], driverPoints];
    })
    .sort((a, b) => b[4] - a[4]);

  // Prepare driver string and write them in the result file
  finalResultArr.forEach((driver) => {
    const name = driver.splice(0, 1)[0];
    const points = driver.splice(driver.length - 1)[0];
    const results = driver
      .map((race) => {
        return race.quali ? `${race.quali}\t${race.race}` : race.race;
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
  addRow(eventResultFile, "\n");
};

module.exports = generateRaceResults;
