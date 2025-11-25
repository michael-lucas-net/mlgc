const boxen = require("boxen").default || require("boxen");
const chalk = require("chalk");

function showWelcome() {
  const message = `
  ${chalk.yellow.bold("🦙 Welcome TO MLGC 🦙")}

  ML Git Changes
  This CLI will help you collect all your git changes in one folder.
`;

  const boxOptions = {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "yellow",
  };

  console.log(boxen(message, boxOptions));
}

module.exports = { showWelcome };
