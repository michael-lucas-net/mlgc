const chalk = require("chalk");

const log = {
  success: (message) => console.log(chalk.green(message)),
  info: (message) => console.log(chalk.cyan(message)),
  warn: (message) => console.log(chalk.yellow(message)),
  error: (message) => console.log(chalk.red(message)),
};

module.exports = { log };
