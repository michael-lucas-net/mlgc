#!/usr/bin/env node
const { Select } = require("enquirer");
const { copy, clearFolder } = require("./src/copy.js");
const settings = require("./data/settings.js");
const generatePath = require("./src/args.js");
const path = generatePath(process.argv);
const { log } = require("./src/commands/output.js");
const { showWelcome } = require("./src/commands/welcome.js");

showWelcome();

new Select({
  name: "menu",
  message: "What can I do for you?",
  choices: [
    "Copy current changes to directory for upload",
    "Copy changes from main branch to directory for upload",
    "Delete all files in upload-directory",
  ],
})
  .run()
  .then((answer) => {
    switch (answer) {
      case "Copy current changes to directory for upload":
        log.info("Alrighty, copying current changes to upload-directory 📁...");
        copy("commit", path);
        break;
      case "Copy changes from main branch to directory for upload":
        log.info(
          "Alrighty, copying changes from main branch to upload-directory 📁..."
        );
        copy("branch", path);
        break;
      case "Delete all files in upload-directory":
        log.info("Sure, let's delete it all 🗑️");
        clearFolder(path + "/" + settings["upload-folder-name"]);
        break;
    }
  })
  .catch(console.error);
