#!/usr/bin/env node
const { showMenu } = require("./menu");
const { showWelcome } = require("../commands/welcome");

async function main() {
  showWelcome();
  await showMenu();
}

main().catch(console.error);
