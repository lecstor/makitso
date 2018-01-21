const _every = require("lodash/every");

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

function Autocomplete({ context, commandInfo }) {
  return async function keyPress(state, press) {
    if (state.mode().command) {
      let commandLine = state.commandLine();
      let command = state.command();

      if (
        press.key.name === "tab" &&
        commandLine.choices &&
        commandLine.choices.length
      ) {
        // set last word of commandline to the prefix common to all choices
        command = completedCommandPortion(command);
        let text;
        if (commandLine.choices.length === 1) {
          text = `${command}${commandLine.choices[0]} `;
        } else {
          const prefix = findCommonPrefix(commandLine.choices);
          text = `${command}${prefix}`;
        }
        // debug({ help2: help });
        state.command(text);
        state = await commandInfo(state, press);
      }

      commandLine = state.commandLine();
      if (commandLine.choices && commandLine.choices.length) {
        state.footer(commandLine.choices.join(" "));
      } else if (commandLine.description) {
        state.footer(commandLine.description);
      }
    }
    return state;
  };
}

exports = module.exports = Autocomplete;
