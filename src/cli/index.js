#!/usr/bin/env node
const { showMenu } = require("./menu");
const { showWelcome } = require("../commands/welcome");

showWelcome();
showMenu();
