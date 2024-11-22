const fileHelper = require("../helpers/fileHelper");
const { log } = require("../utils/logger");

async function clearFolder(path) {
  try {
    await fileHelper.removeFolder(path);
  } catch (err) {
    log.error(`Failed to clear folder: ${err.message}`);
  }
}

module.exports = { clearFolder };
