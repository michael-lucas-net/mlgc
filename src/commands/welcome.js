const { loadBoxen } = require("../utils/boxenHelper");
const chalk = require("chalk");
const packageJson = require("../../package.json");

async function showWelcome() {
  const version = packageJson.version;
  const message = `
  ${chalk.yellow.bold("🦙 Welcome TO MLGC 🦙")}
  ${chalk.gray(`Version ${version}`)}

  ML Git Changes
  This CLI will help you collect all your git changes in one folder.
`;

  const boxOptions = {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "yellow",
  };

  const boxen = await loadBoxen();
  console.log(boxen(message, boxOptions));
}

module.exports = { showWelcome };
