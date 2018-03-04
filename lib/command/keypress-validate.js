const _map = require("lodash/map");
const _get = require("lodash/get");
const chalk = require("chalk");

function Validate() {
  return async function keyPress(state, press) {
    if (state.returnCommand && state.command.trim()) {
      if (press.key.name === "return") {
        const { info } = state.commandLine();
        if (!info.hasAction) {
          state.returnCommand = false;
          state.header = chalk`{yellow "${state.command.trim()}" is not a complete command}`;
        }
        const missing = _get(info, "input.missing", []);
        if (missing.length) {
          const args = _map(missing, arg => arg.name);
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

exports = module.exports = Validate;
