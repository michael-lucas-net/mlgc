// Author: Michael Lucas

const fs = require("fs").promises;

/**
 * Validates if the given path is valid and not empty.
 *
 * @param {string} path - The path to be validated.
 *
 * @throws {Error} If the path is undefined, null, or an empty string.
 */
const validatePath = (path) => {
  if (path === undefined) {
    throw new Error("Path is undefined");
  }

  if (path === null) {
    throw new Error("Path is null");
  }

  if (path === "") {
    throw new Error("Path is an empty string");
  }
};

/**
 * Creates a folder at the specified path.
 *
 * This function creates a folder at the provided 'path' parameter. Before creating the folder, it validates
 * the path using the 'validatePath' function. If the path is valid and the folder creation is successful,
 * the function resolves. If any error occurs during folder creation, it throws the error.
 *
 * @param {string} path - The path where the folder should be created.
 * @throws {Error} If there's an error during folder creation, it will be thrown.
 * @returns {Promise<void>} A Promise that resolves when the folder is successfully created.
 */
const createFolder = async (path) => {
  validatePath(path);

  try {
    await fs.mkdir(path, { recursive: true });
  } catch (err) {
    throw err;
  }
};

/**
 * Checks if a folder exists at the specified path asynchronously.
 *
 * @param {string} path - The path of the folder to check for existence.
 * @returns {Promise<boolean>} A Promise that resolves to true if the folder exists, and false if it doesn't.
 * @throws {Error} If the provided path is invalid or inaccessible.
 */
const folderExists = async (path) => {
  try {
    validatePath(path);
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
};

/**
 * Removes a folder and its contents asynchronously.
 *
 * @param {string} path - The path of the folder to be removed.
 * @throws {Error} If there is an issue while removing the folder.
 * @returns {Promise<void>} A Promise that resolves when the folder and its contents have been removed successfully,
 *                          or rejects with an error if an issue occurs during the removal process.
 */
const removeFolder = async (path) => {
  validatePath(path);

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

/**
 * Asynchronously copies a file from the source path to the destination path.
 * If the destination folder does not exist, it will be created before copying the file.
 * If the destination path is a folder, the function will skip the copy operation.
 *
 * @param {string} source - The path to the source file.
 * @param {string} destination - The path to the destination file or folder.
 * @returns {Promise<boolean>} - A Promise that resolves to true if the file is successfully copied,
 *                               or rejects with an error if any issue occurs during the copy operation.
 */
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

/**
 * Calculates the number of non-empty files in the given array.
 *
 * @param {Array} files - An array of files.
 * @returns {number} The count of non-empty files in the array.
 */
const amountOfFiles = (files) => {
  let amountOfFiles = 0;
  files.forEach((file) => {
    if (file != "") {
      amountOfFiles++;
    }
  });

  return amountOfFiles;
};

module.exports = {
  copyFile,
  removeFolder,
  amountOfFiles,
  createFolder,
  folderExists,
};
