"use strict";

const { Command } = require("commander");
const _forEach = require("lodash/forEach");
const inquirer = require("inquirer");
const coolPrompt = require("inquirer-command-prompt");
const chalk = require("chalk").default;

inquirer.registerPrompt("command", coolPrompt);
const prompt = inquirer.prompt;

/**
 *
 * @param {Object} context - an instance of Context
 * @param {Error} err - an Error
 * @returns {void}
 */
function error(context, err) {
  console.log(chalk.red("Error: "), err.message);
  if (context.debug) {
    console.error(err);
  }
}

/**
 * Initialise Commander
 *
 * @param {Object} context - an instance of Context
 * @param {Object} commands - commands to set
 * @param {Object} cmdOptions - app options
 * @returns {Object} commander instance
 */
function init(context, commands, cmdOptions = {}) {
  const program = new Command();
  const { version = "0.0.0", description = "An interactive commandline app" } =
    cmdOptions.app || {};
  program.version(version).description(description);

  program
    .command("help")
    .alias("h")
    .description("Display this help")
    .action(() => program.outputHelp());

  _forEach(commands, (conf, commandKey) => {
    const { alias, description, action, command = commandKey, options } = conf;
    const comm = program
      .command(command)
      .alias(alias)
      .description(description);
    if (options) {
      options.forEach(option => {
        const [flags, description, fn, defaultValue] = option;
        comm.option(flags, description, fn, defaultValue);
      });
    }
    comm.action((...args) =>
      action(context, ...args).catch(err => error(context, err))
    );
  });

  return program;
}

/**
 *
 * @param {Object} context - an instance of Context
 * @param {Object} commands - commands to set
 * @param {Object} cmdOptions - app options
 * @returns {Promise} -
 */
async function commandPrompt(context, commands, cmdOptions = {}) {
  const program = init(context, commands, cmdOptions);
  const { message = "CommandIt>" } = cmdOptions.prompt || {};
  const { command } = await prompt({
    type: "command", // use coolPrompt with history & autocomplete
    name: "command",
    message,
    autoCompletion: Object.keys(commands)
  });
  await program.parse(["", "", ...command.split(/\s+/)]);
  commandPrompt(context, commands, cmdOptions);
}

module.exports = commandPrompt;
