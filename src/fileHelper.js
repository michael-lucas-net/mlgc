// Author: Michael Lucas

const fs = require("fs").promises;

const createFolder = async (path) => {
  try {
    await fs.mkdir(path, { recursive: true });
  } catch (err) {
    throw err;
  }
};

const folderExists = async (path) => {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
};

const copyFile = async (source, destination) => {
  const destinationFolder = destination.split("/").slice(0, -1).join("/");
  if (!(await folderExists(destinationFolder))) {
    await createFolder(destinationFolder);
  }

  // if destination is a folder, skip
  if (await folderExists(destination)) {
    return;
  }

  // Copy file
  try {
    await fs.copyFile(source, destination);
  } catch (err) {
    throw err;
  }

  return true;
};

const removeFolder = async (path) => {
  // if folder doesn't exist, skip
  if (!(await folderExists(path))) {
    return;
  }

  // Remove folder
  try {
    await fs.rm(path, { recursive: true });
  } catch (err) {
    throw err;
  }
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
