const path = require("path");

function generatePath(args, basePath = process.cwd()) {
  let finalPath = basePath;

  if (process.argv && process.argv.length > 2) {
    const arg = process.argv[2];

    if (arg && arg[0] !== "/") {
      finalPath = path.join(basePath, arg);
    }
  }

  return finalPath;
}

module.exports = generatePath;
