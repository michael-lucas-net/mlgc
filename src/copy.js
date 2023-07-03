// Autor: Michael Lucas

const settings = require("../data/settings.js");
const fileHelper = require("./fileHelper.js");

const getIgnoredFiles = () => {
  let ignoredFiles = " ";
  const grep = "| grep -v '^";

  const ignored = settings["ignored-files"];

  ignored.forEach((file) => {
    ignoredFiles += grep + file + "' ";
  });

  return ignoredFiles;
};

const gitCommand = (branchOrCommit) => {
  const branchName = settings["main-branch"];

  let start = "git add -N . && git diff --name-only ";

  if (branchOrCommit == "branch") {
    start += "origin/" + branchName + getIgnoredFiles();
  } else {
    start += getIgnoredFiles();
  }

  return start;
};

const copy = (branchOrCommit) => {
  console.log(gitCommand(branchOrCommit));

  const { exec } = require("child_process");
  const command = gitCommand(branchOrCommit);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }

    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }

    // stdout should be a list of files
    const files = stdout.split("\n");

    console.log("Found " + files.length + " files.");
    console.log("");

    // copy files to upload-directory
    files.forEach((file) => {
      if (file != "") {
        console.log("Copying " + file);
        fileHelper.copyFile(file, settings["upload-folder-name"] + "/" + file);
      }
    });
  });
};

module.exports = copy;
