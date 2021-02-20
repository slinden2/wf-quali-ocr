const fs = require("fs");

const getApiKey = require("./utils/getApiKey");
const generateQualiResults = require("./programs/generateQualiResults");
const writeResults = require("./utils/writeResults");
const clearOutputFiles = require("./utils/clearOutputFiles");

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

if (SCREENSHOTS.length > 2) {
  throw new Error(
    "More than 2 screenshots found. Please clean up the screenshots folder."
  );
}

const main = async () => {
  const driverResults = await generateQualiResults(
    SCREENSHOT_DIR,
    OUTPUT_DIR,
    OCR_OPTS,
    SCREENSHOTS
  );

  // Write to file
  writeResults(driverResults, RESULT_FILE);

  // Clear output_images
  clearOutputFiles(OUTPUT_DIR);
};

if (require.main === module) {
  main();
}

module.exports = main;
