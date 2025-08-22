const fs = require("fs").promises;

async function validatePath(path) {
  if (!path) {
    throw new Error("Invalid path");
  }
}

async function createFolder(path) {
  await validatePath(path);
  try {
    await fs.mkdir(path, { recursive: true });
  } catch (err) {
    throw new Error(`Failed to create folder: ${err.message}`);
  }
}

async function folderExists(path) {
  try {
    await validatePath(path);
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function removeFolder(path) {
  await validatePath(path);
  if (!(await folderExists(path))) {
    return;
  }
  try {
    await fs.rm(path, { recursive: true });
  } catch (err) {
    throw new Error(`Failed to remove folder: ${err.message}`);
  }
}

async function copyFile(source, destination) {
  const destinationFolder = destination.split("/").slice(0, -1).join("/");

  if (!(await folderExists(destinationFolder))) {
    await createFolder(destinationFolder);
  }

  try {
    await fs.copyFile(source, destination);
  } catch (err) {
    throw new Error(`Failed to copy file: ${err.message}`);
  }
}

module.exports = {
  createFolder,
  folderExists,
  removeFolder,
  copyFile,
};
