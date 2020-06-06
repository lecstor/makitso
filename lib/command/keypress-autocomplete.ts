import _every from "lodash/every";
import { KeyPress, State } from "makitso-prompt";

import { debug } from "../debug";

function allMatch(suggests: string[], match: string) {
  return _every(suggests, (choice) => choice.startsWith(match));
}

function findCommonPrefix(suggests: string[]) {
  const letters = suggests[0].split("");
  debug({ suggests: suggests, letters });
  let prefix = letters.shift();
  if (!prefix) {
    return "";
  }
  while (letters.length && allMatch(suggests, prefix)) {
    prefix += letters.shift();
    debug({ prefix });
  }
  return prefix.slice(0, -1);
}

function completedCommandPortion(command: string) {
  const words = command.split(" ");
  words.pop();
  return words.length ? `${words.join(" ")} ` : ``;
}

export function Autocomplete({
  commandInfo,
}: {
  commandInfo: (state: State) => Promise<void>;
}) {
  return async function keyPress(state: State, press: KeyPress) {
    const commandLine = state.commandLine();
    if (state.mode === "command" && commandLine) {
      let { command } = commandLine;
      let { info } = state.stash;

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
        await commandInfo(state);
      }

      ({ info } = state.stash);
      if (info.suggests && info.suggests.length) {
        state.footer = info.suggests.join(" ");
      } else {
        state.footer = "";
      }
    }
    return state;
  };
}
