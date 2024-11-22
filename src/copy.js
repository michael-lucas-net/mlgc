// Autor: Michael Lucas

const settings = require("../data/settings.js");
const fileHelper = require("./fileHelper.js");
const { log } = require("./commands/output.js");
const boxen = require("boxen");

/**
 * Generates a command-line string for excluding files from a search using grep.
 * This function takes the list of ignored files from the 'settings' object and constructs
 * a command-line string to exclude those files using 'grep -v' (invert-match) option.
 *
 * @returns {string} A command-line string with grep patterns for excluding files.
 */
const getIgnoredFiles = () => {
  let ignoredFiles = " ";
  const grep = "| grep -v '^";

  const ignored = settings["ignored-files"];

  ignored.forEach((file) => {
    ignoredFiles += grep + file + "' ";
  });

  return ignoredFiles;
};

/**
 * Generates a Git command based on the input branchOrCommit.
 *
 * @param {string} branchOrCommit - Specifies whether the Git command should be generated for a branch or a commit.
 *                                  Possible values: "branch" or "commit".
 * @returns {string} The generated Git command.
 */
const gitCommand = (branchOrCommit) => {
  const branchName = settings["main-branch"];

  let start = "git add -N . && git diff --name-only --diff-filter=d ";

  if (branchOrCommit == "branch") {
    start += "origin/" + branchName + getIgnoredFiles();
  } else {
    start += getIgnoredFiles();
  }

  return start;
};

/**
 * Asynchronously clears a folder and all its contents.
 *
 * @param {string} path - The path of the folder to be cleared.
 * @returns {boolean} Returns true if the folder was cleared successfully, otherwise returns false.
 * @throws {Error} Throws an error if there was a problem removing the folder and its contents.
 */
async function clearFolder(path) {
  try {
    await fileHelper.removeFolder(path);
  } catch (err) {
    log.error("An error occurred:", err);
    return false;
  }
  log.success("Finished deleting the folder and files");
  return true;
}

/**
Copies files from a specified branch or commit to a target path.
@param {string} branchOrCommit - Specifies whether the Git command should be generated for a branch or a commit.
                                 Possible values: "branch" or "commit".
@param {string} path - The target path where the files will be copied to.
@async
@function
@throws {Error} If an error occurs during the copying process.
@description
This function moves to the specified path and executes a Git command to retrieve the list of files
from the given branch or commit. It then copies the files to the target "upload-folder-name" within the target path.
If there are no changed files, it logs a message indicating this. If there are errors during the execution,
appropriate error messages are displayed.
*/
const copy = async (branchOrCommit, path) => {
  await clearFolder(path + "/" + settings["upload-folder-name"]);
  const { exec } = require("child_process");

  // move to path
  process.chdir(path);

  const command = gitCommand(branchOrCommit);

  exec(command, async (error, stdout, stderr) => {
    if (error) {
      log.warn(`Seems like there are no changed files :)`);
      return;
    }

    if (stderr) {
      log.error(`stderr: ${stderr}`);
      return;
    }

    // stdout should be a list of files
    const files = stdout.split("\n");

    let amount = 0;
    let fileList = "";

    for (const file of files) {
      if (file !== "") {
        fileList += `- ${file}\n`;
        await fileHelper.copyFile(
          file,
          settings["upload-folder-name"] + "/" + file
        );
        amount++;
      }
    }

    // Erstelle eine Box mit der Liste aller Dateien
    const boxMessage = boxen(`I copied these ${amount} files:\n\n${fileList}`, {
      padding: 1,
      margin: 1,
      borderStyle: "round",
      borderColor: "cyan",
    });

    console.log(boxMessage);

    log.success(`Finished copying ${amount} files.`);
  });
};

module.exports = { copy, clearFolder };
