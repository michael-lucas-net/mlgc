const settings = require("../../config/settings");
const { execSync } = require("child_process");

function getIgnoredFiles() {
  return settings["ignored-files"]
    .map((file) => `| grep -v '^${file}'`)
    .join(" ");
}

function gitCommand(branchOrCommit) {
  const baseCommand = "git add -N . && git diff --name-only --diff-filter=d ";
  return branchOrCommit === "branch"
    ? `${baseCommand}origin/${getMainBranch()} ${getIgnoredFiles()}`
    : `${baseCommand} ${getIgnoredFiles()}`;
}

function getMainBranch() {
  try {
    // Führe den Git-Befehl aus
    const output = execSync("git symbolic-ref refs/remotes/origin/HEAD", {
      encoding: "utf-8",
    });
    // Extrahiere den Branch-Namen aus dem Pfad
    return output.trim().split("/").pop();
  } catch (error) {
    console.error("Error detecting main branch:", error.message);
    // Fallback auf "master", falls der Befehl fehlschlägt
    return "master";
  }
}

module.exports = { gitCommand };
