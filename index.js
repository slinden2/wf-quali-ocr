const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const ocrSpace = require("ocr-space-api-wrapper");

const getApiKey = require("./getApiKey");
const stringSimilarity = require("./stringSimilarity");

const OCR_API_KEY = getApiKey();
const SCREENSHOT_DIR = "screenshots";
const OUTPUT_DIR = "output_images";
const screenshots = fs.readdirSync(SCREENSHOT_DIR);

if (screenshots.length > 2) {
  throw new Error(
    "More than 2 screenshots found. Please clean up the screenshots folder."
  );
}

const convertMMSSsssToS = (str) => {
  const mins = Number(str.slice(0, 2));
  const secs = Number(str.slice(3, 5));
  const fract = Number(str.slice(6)) / 1000;
  return mins * 60 + secs + fract;
};

const removeDuplicates = (object) => {
  const driverObject = JSON.parse(JSON.stringify(object));

  // Remove duplicates
  const potentialDupes = [];

  // Compare timeStrs between drivers to find identical ones.
  // Returns an array of arrays of two names that have identical times
  for (const driver1 in driverObject) {
    for (const driver2 in driverObject) {
      if (driver1 === driver2) continue;
      if (
        driverObject[driver1].timeStr === driverObject[driver2].timeStr &&
        !driverObject[driver1].isDupe &&
        !driverObject[driver2].isDupe
      ) {
        potentialDupes.push([driver1, driver2]);
        driverObject[driver1].isDupe = true;
        driverObject[driver2].isDupe = true;
      }
    }
  }

  // Proceed to compare names if they can be duplicates
  const definedDupes = [];
  potentialDupes.forEach((pair) => {
    const name1 = pair[0];
    const name2 = pair[1];
    const similarity = stringSimilarity(name1, name2);
    if (similarity > 0.5) {
      definedDupes.push(name2);
    }
  });

  // Proceed to delete the dupes from driverObject
  definedDupes.forEach((name) => {
    delete driverObject[name];
  });

  return driverObject;
};

const main = async () => {
  // Contains results from the API
  const resArray = [];

  for (const sh of screenshots) {
    const inputPath = path.join(SCREENSHOT_DIR, sh);
    const _driverOutput = path.join(OUTPUT_DIR, `drivers_${sh}`);
    const _timesOutput = path.join(OUTPUT_DIR, `times_${sh}`);
    // Extract driver names into new image
    await sharp(inputPath)
      .toColorspace("b-w")
      .extract({ width: 250, height: 715, top: 260, left: 763 })
      // Area for 1440p
      // .extract({ width: 400, height: 950, top: 350, left: 1012 })
      .resize({ width: 900 })
      .toFile(_driverOutput);
    // Extract lap times into new image
    await sharp(inputPath)
      .toColorspace("b-w")
      .extract({ width: 130, height: 715, top: 260, left: 1530 })
      .resize({ width: 390 })
      // Area for 1440p
      // .extract({ width: 200, height: 950, top: 350, left: 2050 })
      .toFile(_timesOutput);

    const ocrOpts = {
      apiKey: OCR_API_KEY,
      isTable: true,
      OCREngine: 2,
      scale: true,
    };

    const resDrivers = await ocrSpace(_driverOutput, ocrOpts);
    const resTimes = await ocrSpace(_timesOutput, ocrOpts);

    const drivers = resDrivers.ParsedResults[0].ParsedText.split("\t\r\n");
    const lapTimes = resTimes.ParsedResults[0].ParsedText.split("\t\r\n");

    const driverTimes = drivers.reduce((acc, cur, i) => {
      if (cur.length && lapTimes[i]) {
        acc[cur] = lapTimes[i];
      }

      return acc;
    }, {});

    resArray.push(driverTimes);
  }

  // Combine page1 and page2 results. Beware dupes if some names get recognized wrong
  // Add seconds for sorting
  const driverObject = { ...resArray[0], ...resArray[1] };
  for (const i in driverObject) {
    driverObject[i] = {
      timeStr: driverObject[i],
      secs: convertMMSSsssToS(driverObject[i]),
    };
  }

  const driverObjectWithoutDuplicates = removeDuplicates(driverObject);

  // Divide objects into an array so that they can be sorted
  const driverArr = [];
  for (const i in driverObjectWithoutDuplicates) {
    driverArr.push({ name: i, ...driverObjectWithoutDuplicates[i] });
  }

  // Sort by secs
  const finalArr = [...driverArr].sort((a, b) => a.secs - b.secs);

  // Write to file
  finalArr.forEach((driver) => {
    const drvString = `${driver.name}\t${driver.timeStr}\n`;
    process.stdout.write(drvString);

    fs.appendFileSync("results.txt", drvString, (err) => {
      if (err) {
        return console.log(err);
      }
    });
  });

  // Add an empty row after the results
  fs.appendFileSync("results.txt", "\n", (err) => {
    if (err) {
      return console.log(err);
    }
  });

  // Empty output_images
  const outputFiles = fs.readdirSync(OUTPUT_DIR);
  for (const f of outputFiles) {
    try {
      fs.unlinkSync(path.join(OUTPUT_DIR, f));
    } catch (err) {
      console.log(err);
    }
  }
};

if (require.main === module) {
  main();
}

module.exports = main;
