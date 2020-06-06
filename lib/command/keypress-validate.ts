import _map from "lodash/map";
import _get from "lodash/get";
import chalk from "chalk";

import { KeyPress, State } from "makitso-prompt";

export function keyPressValidate() {
  return async function keyPress(state: State, press: KeyPress) {
    if (state.returnCommand && state.command.trim()) {
      if (press.key.name === "return") {
        const { info } = state.stash;
        if (!info.hasAction) {
          state.returnCommand = false;
          state.header = chalk`{yellow "${state.command.trim()}" is not a complete command}`;
        }
        const missing = _get(info, "input.missing", []);
        if (missing.length) {
          const args = _map(missing, (arg) => arg.name);
          const { name, description } = missing[0];
          state.returnCommand = false;
          state.header = chalk`{yellow Missing Args: ${args.join(
            " "
          )}}\r\n{grey Enter ${description || name}}`;
        }
      }
    }
    return state;
  };
}
