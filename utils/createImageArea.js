const sharp = require("sharp");

const createImageArea = async (
  inputPath,
  outputPath,
  width,
  height,
  top,
  left
) => {
  await sharp(inputPath)
    .toColorspace("b-w")
    .extract({ width, height, top, left })
    .resize({ width: width * 4 })
    .toFile(outputPath);
};

module.exports = createImageArea;

// Driver name area for 1440p
// .extract({ width: 400, height: 950, top: 350, left: 1012 })

// Best lap area for 1440p
// .extract({ width: 200, height: 950, top: 350, left: 2050 })
