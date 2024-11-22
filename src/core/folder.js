const fileHelper = require("../helpers/fileHelper");
const { log } = require("../utils/logger");
const settings = require("../../config/settings");
const path = require("path");

async function clearCopyFolder() {
  await clearFolder(`${path}/../${settings["upload-folder-name"]}`);
}

async function clearFolder(path) {
  try {
    await fileHelper.removeFolder(path);
  } catch (err) {
    log.error(`Failed to clear folder: ${err.message}`);
  }
}

module.exports = { clearFolder, clearCopyFolder };
