const { Select } = require("enquirer");
const copy = require("./src/copy.js");
const settings = require("./data/settings.js");
const files = require("./src/fileHelper.js");
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
        console.log("");
        copy("commit", path);
        break;
      case "Copy changes from main branch to directory for upload":
        console.log(
          "Alrighty, copying changes from main branch to upload-directory..."
        );
        copy("branch", path);
        console.log("Done!");
        break;
      case "Delete all files in upload-directory":
        files.removeFolder(path + "/" + settings["upload-folder-name"]);
        console.log("Done!");
        break;
    }
  })
  .catch(console.error);
