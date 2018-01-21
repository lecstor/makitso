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
      let { command, info } = state.commandLine();

      if (press.key.name === "tab" && info.choices && info.choices.length) {
        // set last word of commandline to the prefix common to all choices
        command = completedCommandPortion(command);
        let text;
        if (info.choices.length === 1) {
          text = `${command}${info.choices[0]} `;
        } else {
          const prefix = findCommonPrefix(info.choices);
          text = `${command}${prefix}`;
        }
        // debug({ help2: help });
        state.command(text);
        await commandInfo(state, press);
      }

      ({ info } = state.commandLine());
      if (info.choices && info.choices.length) {
        state.footer(info.choices.join(" "));
      } else if (info.description) {
        state.footer(info.description);
      }
    }
    return state;
  };
}

exports = module.exports = Autocomplete;
