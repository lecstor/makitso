"use strict";

const history = require("makitso-prompt/key-press-history");

const debug = require("../debug");
const parse = require("./args");
const findCommand = require("./find");
const Autocomplete = require("./keypress-autocomplete");
const AutoHelp = require("./keypress-autohelp");
const CommandInfo = require("./keypress-command-info");
const Validate = require("./keypress-validate");

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
      await appCmd.action({ context, command: appCmd, input });
    }
    return promptAndRun(arg0);
  } catch (error) {
    if (error.message !== "quit") {
      return Promise.reject(error);
    }
  }
}

function initCommandPrompt({ context, commands, prompt }) {
  const commandInfo = CommandInfo({ context, commands });

  const keyPressParser = {
    keyPress: commandInfo
  };

  const keyPressAutocomplete = {
    keyPress: Autocomplete({ context, commandInfo })
  };

  const keyPressAutoHelp = {
    keyPress: AutoHelp({ commandInfo })
  };

  const keyPressValidate = {
    keyPress: Validate()
  };

  Object.assign(prompt, {
    keyPressers: [
      ...prompt.keyPressers,
      history,
      keyPressParser,
      keyPressAutocomplete,
      keyPressAutoHelp,
      keyPressValidate
    ]
  });

  return prompt;
}

/**
 * Start the console app
 *
 * @param {Object} arg0 -
 * @param {Object} arg0.context - An instance of context
 * @param {Object} arg0.commands - app commands
 * @returns {void}
 */
async function start(arg0) {
  const { context, commands, prompt } = arg0;

  initCommandPrompt({ context, commands, prompt });
  return promptAndRun({ context, commands, prompt });
}

module.exports = start;
