"use strict";

const inquirer = require("inquirer");
const term = require("terminal-kit").terminal;
const chalk = require("chalk").default;
const parse = require("./args");
const autoCompleteFn = require("./autocomplete");
const findCommand = require("./find");
const iPrompt = require("./prompt");
const validateFn = require("./validation");

inquirer.registerPrompt("custom", iPrompt);
const prompt = inquirer.prompt;

const True = () => true;

/**
 *
 * @param {Object} context - an instance of Context
 * @param {Error} err - an Error
 * @returns {void}
 */
function logError(context, err) {
  if (context.debug || process.env.MAKITSO_DEBUG) {
    console.error(err);
  } else {
    term(`${chalk.red("Error:")} ${err.message}`);
  }
}

/**
 * Prompt the user for a command
 *
 * @param {Object} args -
 * @param {Function} args.complete - autocomplete
 * @param {Function} args.validate - command validation
 * @param {Object} args.options - prompt options
 * @returns {String} the command from the commandline
 */
async function commandPrompt(args) {
  const { complete, validate, options = {} } = args;
  const { message = "CommandIt>" } = options;
  const { cmdLine } = await prompt({
    type: "custom",
    name: "cmdLine",
    message,
    autoCompletion: complete,
    validate
  });
  return cmdLine;
}

/**
 * Prompt the user for a command and run it
 *
 * @param {Object} arg0 -
 * @param {Object} arg0.context - An instance of context
 * @param {Object} arg0.commands - app commands
 * @param {Object} arg0.options - app options
 * @param {Function|Array} [arg0.complete=[]] - prompt autocomplete
 * @param {Function} [arg0.validate] - prompt validation
 * @returns {void}
 */
async function promptAndRun(arg0) {
  const { context, commands, complete = [], validate = True } = arg0;
  const options = arg0.options.prompt;
  try {
    term.moveTo(0, term.height - 1);
    const cmdLine = await commandPrompt({ complete, validate, options });
    const cmd = await findCommand({ cmdLine, commands });
    if (cmd) {
      const { appCmd, cmdArgs } = cmd;
      const input = parse({ appCmd, cmdArgs });
      term.down(1).eraseLine();
      await appCmd.action({ context, input });
      term.scrollUp(2);
    }
  } catch (error) {
    if (error.message === "quit") {
      // tests are blocked without these
      // process.stdin.pause();
      return new Promise((resolve, reject) => {
        term.asyncCleanup(() => resolve());
      });
    }
    logError(context, error);
  }
  return promptAndRun(arg0);
}

/**
 * Start the console app
 *
 * @param {Object} args -
 * @param {Object} args.context - An instance of context
 * @param {Object} args.commands - app commands
 * @param {Object} args.options - app options
 * @returns {void}
 */
async function start(args) {
  const { context, commands, options } = args;
  const complete = autoCompleteFn({ context, commands });
  const validate = validateFn({ commands });
  term.scrollUp(2);
  return promptAndRun({ context, commands, options, complete, validate });
}

module.exports = start;
