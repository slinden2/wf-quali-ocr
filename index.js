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

/* 
MODES
  1:    Qualification. Gets results from the screenshots sorted by best lap and writes them
        in the result file. Writes also the server message commands to form the grid.
  2:    Race. Gets results from the screenshots in the order they are in. Writes the
        driver names in the results file in their finishig order.
  3:    Race w/ points. Just like 2, but writes also the points by position found
        in the points file for each driver.
  4:    Event. Calculates the complete event results based on the data found in the results file.
  5:    Player List. Fetches the list of players from the event server and saves them into
        player list file. This file is needed for fixing errors caused by the OCR software
        when reading data from the screenshots.
  6:    Rallycross Qualification. Gets rallycross results from the screenshots 1 heat at a time.
        Considers first 5 names in the screenshots to be drivers. If there are 20 participants,
        you would have 4 screenshots in the screenshot folder before running the program.
        Then you would repeat the process for all 4 heats. The results are saved in the
        rallycross results file.
  7:    Rallycross Event. Calculates rallycross total event results based on whats in
        rallycross results file and saves them in rallycross event results file.
  8:    Reverse Grid. Like races with points, but writes also the server messages
        for grid formations in the results file. In reversed order based on the results
        of the previous race.
*/
const MODES = [1, 2, 3, 4, 5, 6, 7, 8];

let mode = Number(process.argv[2]);

const screenshotLimitRegular = mode === 1 || mode === 2 || mode === 3;
const screenshotLimitRx = mode === 6;

// Check that screenshots folder contains max 2 screenshots (excl rallycross)
if (screenshotLimitRegular && screenshots.length > 2) {
  throw new Error(
    "More than 2 screenshots found. Please clean up the screenshots folder."
  );
}

// Check that screenshots folder contains 4 or 5 screenshots (only rallycross)
if (
  screenshotLimitRx &&
  (!screenshots.length === 4 || !screenshots.length === 5)
) {
  throw new Error(
    "Screenshots folder must contain 4 or 5 screenshots of rallycross results"
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

  if (mode === 2 || mode === 3 || mode === 8) {
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
