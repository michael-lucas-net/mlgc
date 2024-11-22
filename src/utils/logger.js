const chalk = require("chalk");

const log = {
  success: (message) => console.log(chalk.green(`[SUCCESS] ${message}`)),
  info: (message) => console.log(chalk.cyan(`[INFO] ${message}`)),
  warn: (message) => console.log(chalk.yellow(`[WARN] ${message}`)),
  error: (message) => console.log(chalk.red(`[ERROR] ${message}`)),
};

module.exports = { log };
