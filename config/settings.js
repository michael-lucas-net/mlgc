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
    "node_modules/",
    "dist/",
    "build/",
    ".cache/",
    ".editorconfig",
    ".eslintignore",
    ".eslintrc",
    ".prettierrc",
    ".prettierignore",
    "coverage/",
    ".nyc_output/",
    ".DS_Store",
    "Thumbs.db",
    "*.log",
    "*.tmp",
    "*.swp",
    "*.bak",
    "*.old",
    "*.orig",
    "public/",
    "webpack.config.js",
    "vite.config.js",
    "rollup.config.js",
    ".parcel-cache/",
    "vendor/",
  ],
};

module.exports = settings;
