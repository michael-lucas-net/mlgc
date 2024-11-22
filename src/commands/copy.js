const { gitCommand } = require("../core/git");
const { clearFolder } = require("../core/folder");
const { log } = require("../utils/logger");
const fileHelper = require("../helpers/fileHelper");
const settings = require("../../config/settings");

async function copy(branchOrCommit, path) {
  await clearFolder(`${path}/${settings.uploadFolderName}`);
  const { exec } = require("child_process");

  process.chdir(path);
  const command = gitCommand(branchOrCommit);

  exec(command, async (error, stdout) => {
    if (error) {
      log.warn("No changes found.");
      return;
    }

    const files = stdout.split("\n").filter((file) => file !== "");

    if (files.length === 0) {
      log.info("No changes found.");
      return;
    }

    for (const file of files) {
      await fileHelper.copyFile(
        file,
        `${settings["upload-folder-name"]}/${file}`
      );
    }
    log.success(`Copied ${files.length} files.`);
  });
}

module.exports = { copy };
