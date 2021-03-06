const getApiKey = require("./utils/getApiKey");
const generateQualiResults = require("./programs/generateQualiResults");
const generateEventResults = require("./programs/generateEventResults");
const writeResults = require("./utils/writeResults");
const clearOutputFiles = require("./utils/clearOutputFiles");
const generateRaceResults = require("./programs/generateRaceResults");
const clearScreenshots = require("./utils/clearScreenshots");
const getScreenshots = require("./utils/getScreenshots");

const OCR_API_KEY = getApiKey();
const SCREENSHOT_DIR = "screenshots";
const BACKUP_DIR = "_old";
const OUTPUT_DIR = "output_images";
const RESULT_FILE = "results.txt";
const RACE_RESULT_FILE = "event_results.txt";

const screenshots = getScreenshots(SCREENSHOT_DIR);

const OCR_OPTS = {
  apiKey: OCR_API_KEY,
  isTable: true,
  OCREngine: 2,
  scale: true,
};

// 1=quali 2=race 3=race w/ points 4=event
const MODES = [1, 2, 3, 4];

let mode = Number(process.argv[2]);

// Check that screenshots folder contains max 2 screenshots
if (screenshots.length > 2) {
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
      screenshots
    );
  }

  if (mode === 2 || mode === 3) {
    results = await generateRaceResults(
      SCREENSHOT_DIR,
      OUTPUT_DIR,
      OCR_OPTS,
      screenshots
    );
  }

  if (mode === 4) {
    generateEventResults(RESULT_FILE, RACE_RESULT_FILE);
    return;
  }

  if (!results || !Array.isArray(results)) {
    throw new Error("Something went wrong. No results array available.");
  }

  // Write to file
  writeResults(results, RESULT_FILE, mode);

  // Clear output_images
  clearOutputFiles(OUTPUT_DIR);

  // Clear screenshots
  clearScreenshots(SCREENSHOT_DIR, BACKUP_DIR);
};

if (require.main === module) {
  main().catch((err) => {
    console.log(err);
    process.exit(1);
  });
}

module.exports = main;
