"use strict";

const chalk = require("chalk");
const Prompt = require("makitso-prompt");
const history = require("makitso-prompt/key-press-history");

const debug = require("../debug");
const parse = require("./args");
const findCommand = require("./find");
const Autocomplete = require("./keypress-autocomplete");
const CommandInfo = require("./keypress-command-info");

// const validateFn = require("./validation");

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
  const { context, commands, prompt } = arg0;
  try {
    const cmdLine = await prompt.start();
    debug({ cmdLine });
    const cmd = await findCommand({ cmdLine, commands });
    if (cmd) {
      const { appCmd, cmdArgs } = cmd;
      const input = parse({ appCmd, cmdArgs });
      debug({ appCmd, cmdArgs, input });
      await appCmd.action({ context, input });
    }
  } catch (error) {
    if (error.message !== "quit") {
      console.error(error);
    }
    return;
  }
  return promptAndRun(arg0);
}

function getCommandPrompt({ context, commands, options = {} }) {
  const prompt = Prompt({ prompt: options.prompt || chalk`{blue Makitso> }` });

  const commandInfo = CommandInfo({ context, commands });

  const keyPressParser = {
    keyPress: commandInfo
  };

  const keyPressAutocomplete = {
    keyPress: Autocomplete(commandInfo)
  };

  Object.assign(prompt, {
    keyPressers: [
      ...prompt.keyPressers,
      history,
      keyPressParser,
      keyPressAutocomplete
    ]
  });

  return prompt;
  // const validate = validateFn({ commands });
}

/**
 * Start the console app
 *
 * @param {Object} arg0 -
 * @param {Object} arg0.context - An instance of context
 * @param {Object} arg0.commands - app commands
 * @param {Object} arg0.options - app options
 * @returns {void}
 */
async function start(arg0) {
  const { context, commands, options } = arg0;
  const prompt = getCommandPrompt({ context, commands, options });
  return promptAndRun({ context, commands, prompt });
}

module.exports = start;
