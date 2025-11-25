const { Select } = require("enquirer");
const { copy, copySelective } = require("../commands/copy");
const { clearCopyFolder } = require("../core/folder");
const { showChangelog } = require("../commands/changelog");
const generatePath = require("../helpers/pathHelper");
const { log } = require("../utils/logger");

async function showMenu() {
  try {
    const path = generatePath(process.argv);

    const prompt = new Select({
      name: "menu",
      message: "🦙 What can I do for you?",
      choices: [
        "📄 Copy current changes to directory for upload",
        "✨ Copy selected files interactively",
        "🗑️  Delete all files in upload-directory",
        "📜 Show changelog",
      ],
    });

    const answer = await prompt.run();

    switch (answer) {
      case "📄 Copy current changes to directory for upload": {
        const modePrompt = new Select({
          name: "mode",
          message: "Select comparison mode:",
          choices: [
            { name: "commit", message: "📄 Current changes (commit)", value: "commit" },
            { name: "branch", message: "🌿 Changes compared to main branch", value: "branch" },
          ],
        });
        const mode = await modePrompt.run();
        log.info(`📄 Copying changes (${mode === "commit" ? "commit" : "branch"} mode)...`);
        copy(mode, path);
        break;
      }
      case "✨ Copy selected files interactively": {
        const modePrompt = new Select({
          name: "mode",
          message: "Select comparison mode:",
          choices: [
            { name: "commit", message: "📄 Current changes (commit)", value: "commit" },
            { name: "branch", message: "🌿 Changes compared to main branch", value: "branch" },
          ],
        });
        const mode = await modePrompt.run();
        log.info(`📋 Copying selected files (${mode === "commit" ? "commit" : "branch"} mode)...`);
        await copySelective(mode, path);
        break;
      }
      case "🗑️  Delete all files in upload-directory":
        log.info("🗑️  Deleting files and folder...");
        await clearCopyFolder();
        log.success("✅ Folder cleared successfully.");
        break;
      case "📜 Show changelog":
        await showChangelog();
        break;
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = { showMenu };
