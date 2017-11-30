const Enquirer = require("Enquirer");
const promptInput = require("prompt-input");
const promptCommand = require("./prompts/prompt-command");

function createEnquirer() {
  const enquirer = new Enquirer();
  enquirer.register("input", promptInput);
  enquirer.register("command", promptCommand);
  return enquirer;
}

module.exports = createEnquirer;
