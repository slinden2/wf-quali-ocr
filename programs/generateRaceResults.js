const path = require("path");
const fs = require("fs");
const ocrSpace = require("ocr-space-api-wrapper");

const createImageArea = require("../utils/createImageArea");
const removeDuplicates = require("../utils/removeDuplicates");
const { fstat } = require("fs");

const generateRaceResults = async (
  screenshotDir,
  outputDir,
  ocrOpts,
  screenshots
) => {
  // Contains results from the API
  const resArray = [];

  for (const sh of screenshots) {
    const inputPath = path.join(screenshotDir, sh);
    const _driverOutput = path.join(outputDir, `drivers_${sh}`);
    const _posOutput = path.join(outputDir, `pos_${sh}`);
    const _dnfOutput = path.join(outputDir, `dnf_${sh}`);

    // Extract driver names into new image
    await createImageArea(inputPath, _driverOutput, 250, 715, 260, 763);

    // Extract positions into new image
    await createImageArea(inputPath, _posOutput, 50, 715, 260, 650);

    // Extract dnf column into new image
    await createImageArea(inputPath, _dnfOutput, 50, 715, 260, 1435);

    const resDrivers = await ocrSpace(_driverOutput, ocrOpts);
    const resPositions = await ocrSpace(_posOutput, ocrOpts);
    const resDnf = await ocrSpace(_dnfOutput, ocrOpts);

    const drivers = resDrivers.ParsedResults[0].ParsedText.split("\t\r\n");
    const positions = resPositions.ParsedResults[0].ParsedText.split("\t\r\n");
    const dnf = resDnf.ParsedResults[0].ParsedText.split("\t\r\n");

    const driverPositions = drivers.reduce((acc, cur, i) => {
      if (cur.length && positions[i]) {
        acc[cur] = { pos: Number(positions[i]), dnf: dnf[i] === "DNF" };
      }

      return acc;
    }, {});

    resArray.push(driverPositions);
  }

  const driverObject = { ...resArray[0], ...resArray[1] };

  // Get rid of duplicates generated by flaky OCR
  const driverObjectWithoutDuplicates = removeDuplicates(driverObject, "pos");

  // Get points object
  const points = fs
    .readFileSync("points.txt", "utf8")
    .split("\r\n")
    .map((row) => row.split(" "))
    .reduce((acc, cur) => {
      acc[cur[0]] = cur[1];
      return acc;
    }, {});

  // Add points to driver object
  for (const driver in driverObjectWithoutDuplicates) {
    driverObjectWithoutDuplicates[driver].points = Number(
      points[driverObjectWithoutDuplicates[driver].pos]
    );

    // Reset points if dnf
    if (driverObjectWithoutDuplicates[driver].dnf) {
      driverObjectWithoutDuplicates[driver].points = 0;
    }
  }

  // Divide objects into an array
  const driverArr = [];
  for (const i in driverObjectWithoutDuplicates) {
    driverArr.push({ name: i, ...driverObjectWithoutDuplicates[i] });
  }

  // Sort by pos (should be sorted already but just in case)
  const finalArr = [...driverArr].sort((a, b) => a.pos - b.pos);

  // Return sorted final results
  return finalArr.map((driver) => ({
    field1: driver.name,
    field2: driver.points,
  }));
};

module.exports = generateRaceResults;