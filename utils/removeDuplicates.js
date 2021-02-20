const stringSimilarity = require("./stringSimilarity");

const removeDuplicates = (object, discriminantProp) => {
  const driverObject = JSON.parse(JSON.stringify(object));

  // Remove duplicates
  const potentialDupes = [];

  // Compare discriminantProp (timeStr or pos) between drivers to find identical ones.
  // Returns an array of arrays of two names that have identical times
  for (const driver1 in driverObject) {
    for (const driver2 in driverObject) {
      if (driver1 === driver2) continue;
      if (
        driverObject[driver1][discriminantProp] ===
          driverObject[driver2][discriminantProp] &&
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

module.exports = removeDuplicates;
