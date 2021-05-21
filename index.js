const getApiKey = require("./utils/getApiKey");
const generateQualiResults = require("./programs/generateQualiResults");
const generateEventResults = require("./programs/generateEventResults");
const writeResults = require("./utils/writeResults");
const clearOutputFiles = require("./utils/clearOutputFiles");
const generateRaceResults = require("./programs/generateRaceResults");
const clearScreenshots = require("./utils/clearScreenshots");
const getScreenshots = require("./utils/getScreenshots");
const generatePlayerList = require("./programs/generatePlayerList");
const addPointField = require("./utils/addPointField");
const generateRxResults = require("./programs/generateRxResults");

const OCR_API_KEY = getApiKey();
const SCREENSHOT_DIR = "screenshots";
const BACKUP_DIR = "_old";
const OUTPUT_DIR = "output_images";
const RESULT_FILE = "results.txt";
const RACE_RESULT_FILE = "event_results.txt";
const PLAYER_LIST_FILE = "player_list.txt";

const screenshots = getScreenshots(SCREENSHOT_DIR);

const OCR_OPTS = {
  apiKey: OCR_API_KEY,
  isTable: true,
  OCREngine: 2,
  scale: true,
};

// 1=quali 2=race 3=race w/ points 4=event 5=player list 6=rx quali 7=rx event
const MODES = [1, 2, 3, 4, 5, 6, 7];

let mode = Number(process.argv[2]);

// Check that screenshots folder contains max 2 screenshots (excl rallycross)
if (mode !== 6 && screenshots.length > 2) {
  throw new Error(
    "More than 2 screenshots found. Please clean up the screenshots folder."
  );
}

// Check that screenshots folder contains 5 screenshots (only rallycross)
if (mode === 6 && screenshots.length !== 5) {
  throw new Error(
    "Screenshots folder must contain 5 screenshots of rallycross results"
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
      screenshots,
      PLAYER_LIST_FILE
    );
  }

  if (mode === 2 || mode === 3) {
    results = await generateRaceResults(
      SCREENSHOT_DIR,
      OUTPUT_DIR,
      OCR_OPTS,
      screenshots,
      PLAYER_LIST_FILE
    );
  }

  if (mode === 4) {
    generateEventResults(RESULT_FILE, RACE_RESULT_FILE);
    return;
  }

  if (mode === 5) {
    await generatePlayerList(PLAYER_LIST_FILE);
    return;
  }

  if (mode === 6) {
    const qualiResults = await generateQualiResults(
      SCREENSHOT_DIR,
      OUTPUT_DIR,
      OCR_OPTS,
      screenshots,
      PLAYER_LIST_FILE,
      true
    );
    results = addPointField(qualiResults);
  }

  if (mode === 7) {
    generateRxResults(RESULT_FILE, RACE_RESULT_FILE);
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
  main()
    .catch((err) => {
      console.log(err);
      process.exit(1);
    })
    .finally(() => process.exit(0));
}

module.exports = main;
