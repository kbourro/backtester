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

export { roundToTwo, insertProperty };
