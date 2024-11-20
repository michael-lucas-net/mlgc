// Autor: Michael Lucas

const settings = require("../data/settings.js");
const fileHelper = require("./fileHelper.js");

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
    console.error("An error occurred:", err);
    return false;
  }
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
      console.log(`Seems like there are no changed files :)`);
      return;
    }

    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }

    // stdout should be a list of files
    const files = stdout.split("\n");

    // log amount of files (not folders)
    console.log("");
    console.log("Found " + fileHelper.amountOfFiles(files) + " file(s):");

    // copy files to upload-directory
    files.forEach(async (file) => {
      if (file != "") {
        console.log("Copying " + file + "...");
        await fileHelper.copyFile(
          file,
          settings["upload-folder-name"] + "/" + file
        );
      }
    });
  });
};

module.exports = { copy, clearFolder };
