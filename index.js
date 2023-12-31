#!/usr/bin/env node
const { Select } = require("enquirer");
const { copy, clearFolder } = require("./src/copy.js");
const settings = require("./data/settings.js");
const generatePath = require("./src/args.js");
const path = generatePath(process.argv);

const prompt = new Select({
  name: "menu",
  message: "What do you want to do?",
  choices: [
    "Copy current changes to directory for upload",
    "Copy changes from main branch to directory for upload",
    "Delete all files in upload-directory",
  ],
});

prompt
  .run()
  .then((answer) => {
    switch (answer) {
      case "Copy current changes to directory for upload":
        console.log("Alrighty, copying current changes to upload-directory...");
        copy("commit", path);
        break;
      case "Copy changes from main branch to directory for upload":
        console.log(
          "Alrighty, copying changes from main branch to upload-directory..."
        );
        copy("branch", path);
        break;
      case "Delete all files in upload-directory":
        clearFolder(path + "/" + settings["upload-folder-name"]);
        break;
    }
  })
  .catch(console.error);
