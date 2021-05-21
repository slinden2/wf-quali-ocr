const getPointsObject = require("./getPointsObject");

const addPointField = (fieldArray) => {
  const points = getPointsObject();
  return fieldArray.map((arr, i) => {
    return [...arr, i + 1, points[i + 1]];
  });
};

module.exports = addPointField;
