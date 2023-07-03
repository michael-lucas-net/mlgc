const getPathWhereUserCurrentlyIs = require("./path.js");

function generatePath(args) {
  let path = getPathWhereUserCurrentlyIs();
  // get parameters
  if (process.argv.length > 2) {
    // Das erste Argument befindet sich an Index 2
    const arg = process.argv[2];

    if (arg != "") {
      path += "/" + arg;
    }
  }

  return path;
}

module.exports = generatePath;
