const _every = require("lodash/every");

const { applyPatch } = require("makitso-prompt/immutably");

const debug = require("../debug");

function allMatch(choices, match) {
  return _every(choices, choice => choice.startsWith(match));
}

function findCommonPrefix(choices) {
  const letters = choices[0].split("");
  debug({ choices: choices, letters });
  let prefix = letters.shift();
  while (letters.length && allMatch(choices, prefix)) {
    prefix += letters.shift();
    debug({ prefix });
  }
  return prefix.slice(0, -1);
}

function completedCommandPortion(command) {
  const words = command.split(" ");
  words.pop();
  return words.length ? `${words.join(" ")} ` : ``;
}

function Autocomplete(commandInfo) {
  return async function keyPress(state, press) {
    if (state.mode.command) {
      let command = state.prompt.command;
      let commandLine = command.text;

      if (
        press.key.name === "tab" &&
        command.choices &&
        command.choices.length
      ) {
        // set last word of commandline to the prefix common to all choices
        commandLine = completedCommandPortion(commandLine);
        let text;
        if (command.choices.length === 1) {
          text = `${commandLine}${command.choices[0]} `;
        } else {
          const prefix = findCommonPrefix(command.choices);
          text = `${commandLine}${prefix}`;
        }
        // debug({ help2: help });
        state = applyPatch(state, {
          prompt: {
            command: { text },
            cursor: { col: null }
          }
        });
        state = await commandInfo(state, press);
      }

      command = state.prompt.command;
      if (command.choices && command.choices.length) {
        state = applyPatch(state, { footer: command.choices.join(" ") });
      } else if (command.description) {
        state = applyPatch(state, { footer: command.description });
      }
    }
    return state;
  };
}

exports = module.exports = Autocomplete;
