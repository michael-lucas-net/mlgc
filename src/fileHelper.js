// Author: Michael Lucas

const fs = require("fs");

const createFolder = (path) => {
  // Create folder, async
  fs.mkdir(path, { recursive: true }, (err) => {
    if (err) throw err;
  });
};

const folderExists = (path) => {
  try {
    const stats = fs.statSync(path);
    return stats.isDirectory();
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    } else {
      throw error;
    }
  }
};

const copyFile = (source, destination) => {
  const destinationFolder = destination.split("/").slice(0, -1).join("/");
  if (!folderExists(destinationFolder)) {
    createFolder(destinationFolder);
  }

  // if destination is a folder, skip
  if (folderExists(destination)) {
    return;
  }

  // Copy file
  fs.copyFile(source, destination, (err) => {
    if (err) throw err;
  });
};

const removeFolder = (path) => {
  // Remove folder
  fs.rmdir(path, { recursive: true }, (err) => {
    if (err) throw err;
  });
};

const amountOfFiles = (files) => {
  let amountOfFiles = 0;
  files.forEach((file) => {
    if (file != "") {
      amountOfFiles++;
    }
  });

  return amountOfFiles;
};

module.exports = { copyFile, removeFolder, amountOfFiles };
