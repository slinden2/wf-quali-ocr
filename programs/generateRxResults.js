/* 
The result format is rows with tab separated values:
Q1time,Q1pos,Q1points, ... ,Q4time,Q4pos,Q4points,totalPoints
**/

const fs = require("fs");
const getResultsFromFile = require("../utils/getResultsFromFile");

const generateRxResults = (resultFile, eventResultFile) => {
  const rawResults = getResultsFromFile(resultFile);

  const groupedDriverResults = Object.values(
    rawResults.reduce((acc, cur, i) => {
      cur.forEach((driver) => {
        const driverName = driver[0];
        const heatPoints = Number(driver.slice(driver.length - 1));
        const driverDataObj = { [Number(i)]: driver.slice(1) };

        if (acc[driverName]) {
          acc[driverName].heats = {
            ...acc[driverName].heats,
            ...driverDataObj,
          };
          acc[driverName].totalPoints += heatPoints;
        } else {
          acc[driverName] = {};
          acc[driverName].name = driverName;
          acc[driverName].heats = driverDataObj;
          acc[driverName].totalPoints = heatPoints;
        }
      });

      return acc;
    }, {})
  ).sort((a, b) => b.totalPoints - a.totalPoints);

  const highestHeatIndex = groupedDriverResults.reduce((acc, cur) => {
    const driverHeats = Math.max(...Object.keys(cur.heats));
    if (acc < driverHeats) {
      acc = driverHeats;
    }
    return acc;
  }, 0);

  let finalStr = "";
  for (const driver of groupedDriverResults) {
    let heatStr = "";
    for (let i = 0; i <= highestHeatIndex; i++) {
      if (driver.heats[i]) {
        heatStr = heatStr.concat(
          `${driver.heats[i][0]}\t${driver.heats[i][1]}\t${driver.heats[i][2]}\t`
        );
      } else {
        heatStr = heatStr.concat("NA\tNA\t0\t");
      }
    }

    finalStr = finalStr.concat(
      `${driver.name}\t${heatStr}${driver.totalPoints}\n`
    );
  }

  fs.appendFileSync(eventResultFile, finalStr, (err) => {
    if (err) {
      return console.log(err);
    }
  });

  fs.appendFileSync(eventResultFile, "\n", (err) => {
    if (err) {
      return console.log(err);
    }
  });
};

module.exports = generateRxResults;
