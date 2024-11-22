const { Select } = require("enquirer");
const { copy } = require("../commands/copy");
const { clearCopyFolder } = require("../core/folder");
const generatePath = require("../helpers/pathHelper");
const { log } = require("../utils/logger");

function showMenu() {
  const path = generatePath(process.argv);

  new Select({
    name: "menu",
    message: "What can I do for you?",
    choices: [
      "Copy current changes to directory for upload",
      "Copy changes from main branch to directory for upload",
      "Delete all files in upload-directory",
    ],
  })
    .run()
    .then((answer) => {
      switch (answer) {
        case "Copy current changes to directory for upload":
          log.info("Copying current changes...");
          copy("commit", path);
          break;
        case "Copy changes from main branch to directory for upload":
          log.info("Copying changes from main branch...");
          copy("branch", path);
          break;
        case "Delete all files in upload-directory":
          log.info("Deleting files and folder...");
          clearCopyFolder();
          log.success("Folder cleared successfully.");
          break;
      }
    })
    .catch(console.error);
}

module.exports = { showMenu };
