/**
 * This script takes an object and compares its keys to the keys in player_list.txt. If it finds
 * that has a similarity high enough it will the key in the player_list.txt in the return file.
 * This avoids name errors caused by the OCR.
 */
const getPlayerList = require("./getPlayerList");
const stringSimilarity = require("./stringSimilarity");

const getCorrectPlayerObject = (inputObj, playerListFile) => {
  const playerList = getPlayerList(playerListFile);

  const correctedDriverObject = {};
  for (const key in inputObj) {
    const probabilities = [];
    playerList.forEach((p) => {
      probabilities.push({ key: p, prob: stringSimilarity(key, p) });
    });
    const sortedProbabilities = [...probabilities].sort(
      (a, b) => b.prob - a.prob
    );

    if (sortedProbabilities[0].prob > 0.65) {
      correctedDriverObject[sortedProbabilities[0].key] = inputObj[key];
    } else {
      correctedDriverObject[key] = inputObj[key];
    }
  }

  return correctedDriverObject;
};

module.exports = getCorrectPlayerObject;
