const path = require("path");

function generatePath(args, basePath = process.cwd()) {
  return args.length > 2 && args[2][0] !== "/"
    ? path.join(basePath, args[2])
    : basePath;
}

module.exports = generatePath;
