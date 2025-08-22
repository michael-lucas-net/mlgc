const { Select } = require("enquirer");
const { copy } = require("../commands/copy");
const { clearCopyFolder } = require("../core/folder");
const { showChangelog } = require("../commands/changelog");
const generatePath = require("../helpers/pathHelper");
const { log } = require("../utils/logger");

async function showMenu() {
  try {
    const path = generatePath(process.argv);

    const answer = await new Select({
      name: "menu",
      message: "🦙 What can I do for you?",
      choices: [
        "📄 Copy current changes to directory for upload",
        "🌿 Copy changes from main branch to directory for upload",
        "🗑️  Delete all files in upload-directory",
        "📋 Show changelog",
      ],
    }).run();

    switch (answer) {
      case "📄 Copy current changes to directory for upload":
        log.info("📄 Copying current changes...");
        copy("commit", path);
        break;
      case "🌿 Copy changes from main branch to directory for upload":
        log.info("🌿 Copying changes from main branch...");
        copy("branch", path);
        break;
      case "🗑️  Delete all files in upload-directory":
        log.info("🗑️  Deleting files and folder...");
        clearCopyFolder();
        log.success("✅ Folder cleared successfully.");
        break;
      case "📋 Show changelog":
        await showChangelog();
        break;
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = { showMenu };