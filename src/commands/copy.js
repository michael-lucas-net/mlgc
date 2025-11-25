const { gitCommand } = require("../core/git");
const { clearCopyFolder } = require("../core/folder");
const { log } = require("../utils/logger");
const fileHelper = require("../helpers/fileHelper");
const settings = require("../../config/settings");
const boxen = require("boxen").default || require("boxen");
const { ProgressBar } = require("../utils/progressBar");
const { Select, MultiSelect } = require("enquirer");
const path = require("path");

async function copy(branchOrCommit, path) {
  await clearCopyFolder();
  const { exec } = require("child_process");

  process.chdir(path);
  const command = gitCommand(branchOrCommit);

  exec(command, async (error, stdout) => {
    if (error) {
      log.warn("No changes found.");
      return;
    }

    const files = stdout.split("\n").filter((file) => file !== "");

    if (files.length === 0) {
      log.info("No changes found.");
      return;
    }

    // Initialize Progress Bar
    const progressBar = new ProgressBar(files.length);
    const copiedFiles = [];
    const failedFiles = [];

    for (const file of files) {
      try {
        await fileHelper.copyFile(
          file,
          `${settings["upload-folder-name"]}/${file}`
        );
        copiedFiles.push(file);
        progressBar.increment(file);
      } catch (err) {
        // Error handling: log warning
        failedFiles.push({ file, error: err.message });
        log.warn(`Failed to copy file: ${err.message}`);
        progressBar.increment(file);
      }
    }

    // Progress Bar stoppen
    progressBar.stop();

    // Ergebnis anzeigen
    if (copiedFiles.length > 0) {
      const fileList = copiedFiles.map((file) => `- ${file}`).join("\n");
      const elapsedTime = progressBar.getElapsedTime();

      const boxContent = boxen(
        `Copied the following ${copiedFiles.length} file(s) in ${elapsedTime.toFixed(2)}s:\n\n${fileList}`,
        {
          padding: 1,
          margin: 1,
          borderStyle: "round",
          borderColor: "cyan",
        }
      );

      console.log(boxContent);
      log.success(`Copied ${copiedFiles.length} file(s) in ${elapsedTime.toFixed(2)}s.`);
    }

    if (failedFiles.length > 0) {
      log.warn(`${failedFiles.length} file(s) failed to copy.`);
    }
  });
}

/**
 * Filters files by file type
 * @param {string[]} files - Array of file paths
 * @param {string|string[]} fileTypes - File type(s) to filter by (e.g. '.js' or ['.js', '.ts'])
 * @returns {string[]} Filtered files
 */
function filterFilesByType(files, fileTypes) {
  if (!fileTypes || fileTypes === "all" || (Array.isArray(fileTypes) && fileTypes.includes("all"))) {
    return files;
  }

  const types = Array.isArray(fileTypes) ? fileTypes : [fileTypes];
  return files.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return types.some((type) => {
      const normalizedType = type.startsWith(".") ? type.toLowerCase() : `.${type.toLowerCase()}`;
      return ext === normalizedType;
    });
  });
}

/**
 * Determines available file types from a list of files
 * @param {string[]} files - Array of file paths
 * @returns {string[]} Array of unique file types
 */
function getAvailableFileTypes(files) {
  const types = new Set();
  files.forEach((file) => {
    const ext = path.extname(file).toLowerCase();
    if (ext) {
      types.add(ext);
    }
  });
  return Array.from(types).sort();
}

async function copySelective(branchOrCommit, path) {
  await clearCopyFolder();
  const { exec } = require("child_process");

  process.chdir(path);
  const command = gitCommand(branchOrCommit);

  return new Promise((resolve) => {
    exec(command, async (error, stdout) => {
      if (error) {
        log.warn("No changes found.");
        resolve();
        return;
      }

      const files = stdout.split("\n").filter((file) => file !== "");

      if (files.length === 0) {
        log.info("No changes found.");
        resolve();
        return;
      }

      try {
        // Step 1: Select file type filter
        const availableTypes = getAvailableFileTypes(files);
        const filterChoices = [
          { name: "all", message: "All files", value: "all" },
          ...availableTypes.map((type) => ({
            name: type,
            message: `${type} files`,
            value: type,
          })),
        ];

        const filterPrompt = new Select({
          name: "fileType",
          message: "📋 Select a file type filter:",
          choices: filterChoices,
        });

        const selectedFilter = await filterPrompt.run();
        let filteredFiles = files;

        if (selectedFilter !== "all") {
          filteredFiles = filterFilesByType(files, selectedFilter);
        }

        if (filteredFiles.length === 0) {
          log.info(`No files found for filter: ${selectedFilter}`);
          resolve();
          return;
        }

        // Step 2: Select individual files
        const fileChoices = filteredFiles.map((file) => ({
          name: file,
          message: file,
          value: file,
        }));

        const filePrompt = new MultiSelect({
          name: "files",
          message: `📄 Select files to copy (${filteredFiles.length} available):`,
          choices: fileChoices,
          limit: Math.min(filteredFiles.length, 10),
          hint: "Press <space> to select/deselect files, <enter> to confirm selection",
          instructions: "Press <space> to select, <enter> to confirm",
        });

        const selectedFiles = await filePrompt.run();

        if (!selectedFiles || selectedFiles.length === 0) {
          log.info("No files selected.");
          resolve();
          return;
        }

        // Step 3: Copy selected files
        const progressBar = new ProgressBar(selectedFiles.length);
        const copiedFiles = [];
        const failedFiles = [];

        for (const file of selectedFiles) {
          try {
            await fileHelper.copyFile(
              file,
              `${settings["upload-folder-name"]}/${file}`
            );
            copiedFiles.push(file);
            progressBar.increment(file);
          } catch (err) {
            failedFiles.push({ file, error: err.message });
            log.warn(`Failed to copy file: ${err.message}`);
            progressBar.increment(file);
          }
        }

        progressBar.stop();

        // Ergebnis anzeigen
        if (copiedFiles.length > 0) {
          const fileList = copiedFiles.map((file) => `- ${file}`).join("\n");
          const elapsedTime = progressBar.getElapsedTime();

          const boxContent = boxen(
            `Copied the following ${copiedFiles.length} file(s) in ${elapsedTime.toFixed(2)}s:\n\n${fileList}`,
            {
              padding: 1,
              margin: 1,
              borderStyle: "round",
              borderColor: "cyan",
            }
          );

          console.log(boxContent);
          log.success(`Copied ${copiedFiles.length} file(s) in ${elapsedTime.toFixed(2)}s.`);
        }

        if (failedFiles.length > 0) {
          log.warn(`${failedFiles.length} file(s) failed to copy.`);
        }

        resolve();
      } catch (err) {
        if (err.name === "ENOENT" || err.message === "cancelled") {
          log.info("Selection cancelled.");
        } else {
          log.error(`Error during selective copy: ${err.message}`);
        }
        resolve();
      }
    });
  });
}

module.exports = { copy, copySelective, filterFilesByType };
