"use strict";

const yargs = require("yargs/yargs");
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
function logError(context, err) {
  console.log(chalk.red("Error: "), err.message);
  if (context.debug) {
    console.error(err);
  }
}

/**
 * Initialise Yargs
 *
 * @param {Object} context - an instance of Context
 * @param {Object} commands - commands to set
 * @param {Object} cmdOptions - app options
 * @returns {Object} yargs instance
 */
function init(context, commands, cmdOptions = {}) {
  // const program = new Command();
  // const { version = "0.0.0", description = "An interactive commandline app" } =
  //   cmdOptions.app || {};
  // program.version(version).description(description);
  console.log("init");
  const parser = yargs().command(
    ["help", "h"],
    "Display this help",
    {},
    yargs => {
      yargs.showHelp("log");
      commandPrompt(context, commands, cmdOptions);
    }
  );
  console.log("init done");

  _forEach(commands, (conf, commandKey) => {
    // const { alias, description, action, command = commandKey, options } = conf;
    const { alias, description, action, command = commandKey } = conf;
    console.log({ alias, description, command });
    // parser.command([command, alias], description, {}, yargs =>
    parser.command(command, description || "", {}, yargs =>
      action(context, yargs)
        .catch(err => logError(context, err))
        .then(() => commandPrompt(context, commands, cmdOptions))
    );

    // if (options) {
    //   options.forEach(option => {
    //     const [flags, description, fn, defaultValue] = option;
    //     comm.option(flags, description, fn, defaultValue);
    //   });
    // }
  });

  return parser;
}

/**
 *
 * @param {Object} context - an instance of Context
 * @param {Object} commands - commands to set
 * @param {Object} cmdOptions - app options
 * @returns {Promise} -
 */
async function commandPrompt(context, commands, cmdOptions = {}) {
  const parser = init(context, commands, cmdOptions).exitProcess(false);
  const { message = "CommandIt>" } = cmdOptions.prompt || {};
  try {
    const { command } = await prompt({
      type: "command", // use coolPrompt with history & autocomplete
      name: "command",
      message,
      autoCompletion: Object.keys(commands)
    });
    // parser.parse(["", "", ...command.split(/\s+/)]);
    console.log("parse");
    console.log(parser.parse(command));
    console.log("parse done");
  } catch (error) {
    logError(context, error);
    commandPrompt(context, commands, cmdOptions);
  }
}

module.exports = commandPrompt;
