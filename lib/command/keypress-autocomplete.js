const _every = require("lodash/every");

const debug = require("../debug");

function allMatch(suggests, match) {
  return _every(suggests, choice => choice.startsWith(match));
}

function findCommonPrefix(suggests) {
  const letters = suggests[0].split("");
  debug({ suggests: suggests, letters });
  let prefix = letters.shift();
  while (letters.length && allMatch(suggests, prefix)) {
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
    if (state.mode === "command") {
      let { command, info } = state.commandLine();

      if (press.key.name === "tab" && info.suggests && info.suggests.length) {
        // set last word of commandline to the prefix common to all suggests
        command = completedCommandPortion(command);
        let text;
        if (info.suggests.length === 1) {
          text = `${command}${info.suggests[0]} `;
        } else {
          const prefix = findCommonPrefix(info.suggests);
          text = `${command}${prefix}`;
        }
        // debug({ help2: help });
        state.command = text;
        await commandInfo(state, press);
      }

      ({ info } = state.commandLine());
      if (info.suggests && info.suggests.length) {
        state.footer = info.suggests.join(" ");
      } else {
        state.footer = null;
      }
    }
    return state;
  };
}

exports = module.exports = Autocomplete;
