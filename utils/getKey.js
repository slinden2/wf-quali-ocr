const getKey = (inputObj, referenceKey) => {
  const definedKeys = Object.keys(inputObj);
  let key = definedKeys.find((key) => key === referenceKey);
  if (!key) {
    definedKeys.forEach((k) => {
      const similarity = stringSimilarity(k, referenceKey);
      if (similarity > 0.5) {
        key = k;
      }
    });
  }
  return key;
};

module.exports = getKey;
