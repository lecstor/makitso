"use strict";

const term = require("terminal-kit").terminal;

const debug = require("../debug");
const parse = require("./args");
const helperFn = require("./command-helper");
const findCommand = require("./find");
const validateFn = require("./validation");

const chalk = require("chalk");
const Prompt = require("makitso-prompt");
// const autoComplete = require("makitso-prompt/key-press-autocomplete");
const history = require("makitso-prompt/key-press-history");
const { applyPatch } = require("makitso-prompt/immutably");

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
  const { context, commands, helper, prompt } = arg0;
  try {
    // term.scrollUp(1);
    // term.moveTo(0, term.height - 1);
    // term.eraseLine();
    const help = await helper("");
    const footer = help.choices.join(" ");
    const cmdLine = await prompt.start({ footer });
    debug({ cmdLine });
    const cmd = await findCommand({ cmdLine, commands });
    if (cmd) {
      const { appCmd, cmdArgs } = cmd;
      const input = parse({ appCmd, cmdArgs });
      debug({ appCmd, cmdArgs, input });
      // term.down(1).eraseLine();
      // term.down(1).eraseLine();
      // term.moveTo(0, term.height - 1);
      await appCmd.action({ context, input });
      // term.scrollUp(2);
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

function getCommandPrompt({ context, commands, helper, options = {} }) {
  const prompt = Prompt({ prompt: options.prompt || chalk`{blue Makitso> }` });

  const keyPressHelper = {
    keyPress: async function(state, press) {
      if (state.mode === "command") {
        let command = state.command.text;
        let help = await helper(command);
        debug({ help });
        if (press.key.name === "tab" && help.choices.length === 1) {
          // complete the command
          const parts = command.split(" ");
          parts.pop();
          command = parts.length ? `${parts.join(" ")} ` : ``;
          const text = `${command}${help.choices[0]} `;
          help = await helper(text);
          debug({ help });
          state = applyPatch(state, {
            command: { text },
            cursor: { col: null }
          });
        }

        state = applyPatch(state, { footer: help.choices.join(" ") });
      }
      return state;
    }
  };

  Object.assign(prompt, {
    keyPressers: [...prompt.keyPressers, keyPressHelper, history]
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
 * @param {Object} arg0.enquirer - enquirer instance
 * @returns {void}
 */
async function start(arg0) {
  const { context, commands, options } = arg0;
  const helper = helperFn({ context, commands });
  const prompt = getCommandPrompt({ context, commands, helper, options });
  return promptAndRun({ context, commands, helper, prompt });
}

module.exports = start;
