#!/usr/bin/env node
const { showMenu } = require("./menu");
const { showWelcome } = require("../commands/welcome");

async function main() {
  await showWelcome();
  await showMenu();
}

main().catch(console.error);
