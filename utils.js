import fs from "fs";
function roundToTwo(num) {
  return +(Math.round(num + "e+2") + "e-2");
}

function insertProperty(obj, key, value, position) {
  var result = {};
  var counter = 0;
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (counter === position) {
        result[key] = value;
      }
      result[prop] = obj[prop];
      counter++;
    }
  }
  if (!(key in result)) {
    result[key] = value;
  }
  return result;
}

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path + "/" + file).isDirectory();
  });
}

function calculateProximity(num1, num2) {
  const difference = Math.abs(num1 - num2);
  const maxDifference = Math.max(Math.abs(num1), Math.abs(num2));
  const proximity = 1 - difference / maxDifference;
  return proximity;
}

export { roundToTwo, insertProperty, getDirectories, calculateProximity };
