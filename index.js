const fs = require("fs");

const getApiKey = require("./utils/getApiKey");
const generateQualiResults = require("./programs/generateQualiResults");
const writeResults = require("./utils/writeResults");
const clearOutputFiles = require("./utils/clearOutputFiles");
const generateRaceResults = require("./programs/generateRaceResults");

const OCR_API_KEY = getApiKey();
const SCREENSHOT_DIR = "screenshots";
const OUTPUT_DIR = "output_images";
const RESULT_FILE = "results.txt";

const SCREENSHOTS = fs.readdirSync(SCREENSHOT_DIR);

const OCR_OPTS = {
  apiKey: OCR_API_KEY,
  isTable: true,
  OCREngine: 2,
  scale: true,
};

// 1=quali 2=race 3=race w/ points
const MODES = [1, 2, 3];

let mode = Number(process.argv[2]);

if (SCREENSHOTS.length > 2) {
  throw new Error(
    "More than 2 screenshots found. Please clean up the screenshots folder."
  );
}

const main = async (modeArg) => {
  let results;

  if (modeArg) {
    mode = Number(modeArg);
  }

  if (!MODES.includes(mode)) {
    throw new Error(`Incorrect mode. Valid: ${MODES}. Provided: ${mode}`);
  }

  if (mode === 1) {
    results = await generateQualiResults(
      SCREENSHOT_DIR,
      OUTPUT_DIR,
      OCR_OPTS,
      SCREENSHOTS
    );
  }

  if (mode === 2 || mode === 3) {
    results = await generateRaceResults(
      SCREENSHOT_DIR,
      OUTPUT_DIR,
      OCR_OPTS,
      SCREENSHOTS
    );
  }

  if (!results || !Array.isArray(results)) {
    throw new Error("Something went wrong. No results array available.");
  }

  // Write to file
  writeResults(results, RESULT_FILE, mode);

  // Clear output_images
  clearOutputFiles(OUTPUT_DIR);
};

if (require.main === module) {
  main().catch((err) => {
    console.log(err);
    process.exit(1);
  });
}

module.exports = main;
