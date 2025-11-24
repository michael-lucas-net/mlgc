const fileHelper = require("../helpers/fileHelper");
const { log } = require("../utils/logger");
const settings = require("../../config/settings");
const path = require("path");

async function clearCopyFolder() {
  const uploadFolderPath = path.join(
    process.cwd(),
    settings["upload-folder-name"]
  );
  await clearFolder(uploadFolderPath);
}

async function clearFolder(path) {
  try {
    await fileHelper.removeFolder(path);
  } catch (err) {
    log.error(`Failed to clear folder: ${err.message}`);
  }
}

module.exports = { clearFolder, clearCopyFolder };
