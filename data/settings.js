// Author: Michael Lucas

const uploadFolderName = "___CHANGES_TO_UPLOAD___";

const settings = {
  "main-branch": "master",
  "upload-folder-name": uploadFolderName,
  "ignored-files": [
    ".git/",
    ".gitignore",
    ".idea/",
    ".vscode/",
    "_copyChangesToDirectoryForUpload.py",
    "composer.json",
    "composer.lock",
    "copyChangesToDirectoryForUpload.py",
    "cypress/",
    "LICENSE",
    "package.json",
    "package-lock.json",
    "README.md",
    uploadFolderName,
    "vendor/",
  ],
};

module.exports = settings;
