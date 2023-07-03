// Author: Michael Lucas

const uploadFolderName = "___CHANGES_TO_UPLOAD___";

const settings = {
  "main-branch": "master",
  "upload-folder-name": uploadFolderName,
  "ignored-files": [
    uploadFolderName,
    ".idea/",
    ".git/",
    ".vscode/",
    "cypress/",
    "_copyChangesToDirectoryForUpload.py",
    "copyChangesToDirectoryForUpload.py",
    ".gitignore",
    "README.md",
    "LICENSE",
    "package.json",
    "package-lock.json",
    "composer.lock",
    "composer.json",
  ],
};

module.exports = settings;
