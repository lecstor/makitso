"use strict";

const term = require("terminal-kit").terminal;

const debug = require("../debug");
const parse = require("./args");
const helperFn = require("./command-helper");
const findCommand = require("./find");
const validateFn = require("./validation");

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
  const { context, commands } = arg0;
  try {
    term.scrollUp(1);
    term.moveTo(0, term.height - 1);
    term.eraseLine();
    const answers = await context.enquirer.ask("command");
    const cmdLine = answers.command;
    debug({ cmdLine });
    const cmd = await findCommand({ cmdLine, commands });
    if (cmd) {
      const { appCmd, cmdArgs } = cmd;
      const input = parse({ appCmd, cmdArgs });
      debug({ appCmd, cmdArgs, input });
      term.down(1).eraseLine();
      term.down(1).eraseLine();
      term.moveTo(0, term.height - 1);
      await appCmd.action({ context, input });
      term.scrollUp(2);
    }
  } catch (error) {
    process.stdin.pause();
    return new Promise((resolve, reject) => {
      term.asyncCleanup(() => {
        if (error.message !== "quit") {
          console.error(error);
        }
        resolve();
      });
    });
  }
  return promptAndRun(arg0);
}

function getCommandPrompt({ context, commands, options }) {
  const helper = helperFn({ context, commands });
  const validate = validateFn({ commands });
  const { message = "Makitso>" } = options.prompt;
  return {
    name: "command",
    type: "command",
    message,
    helper,
    validate,
    prefix: ""
  };
}

/**
 * Start the console app
 *
 * @param {Object} arg0 -
 * @param {Object} arg0.context - An instance of context
 * @param {Object} arg0.commands - app commands
 * @param {Object} arg0.options - app options
 * @param {Object} arg0.enquirer - enquirer instance
 * @returns {void}
 */
async function start(arg0) {
  const { context, commands, options } = arg0;
  context.enquirer.question(getCommandPrompt({ context, commands, options }));
  return promptAndRun({ context, commands });
}

module.exports = start;
