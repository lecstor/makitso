import _filter from "lodash/filter";
import { KeyPress, State } from "makitso-prompt";

export function keyPressAutoComplete(choices: string[]) {
  return {
    keyPress: async function(state: State, press: KeyPress) {
      if (state.mode === "command") {
        const matches = _filter(choices, choice =>
          choice.startsWith(state.command)
        );

        if (press.key && press.key.name === "tab" && matches.length === 1) {
          state.command = matches[0] + " ";
          state.cursorCols = null;
        } else {
          state.footer = matches.join(" ");
        }
      }
      return state;
    }
  };
}
