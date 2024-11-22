const settings = require("../../config/settings");

function getIgnoredFiles() {
  return settings["ignored-files"]
    .map((file) => `| grep -v '^${file}'`)
    .join(" ");
}

function gitCommand(branchOrCommit) {
  const baseCommand = "git add -N . && git diff --name-only --diff-filter=d ";
  return branchOrCommit === "branch"
    ? `${baseCommand}origin/${settings["main-branch"]} ${getIgnoredFiles()}`
    : `${baseCommand} ${getIgnoredFiles()}`;
}

module.exports = { gitCommand };
