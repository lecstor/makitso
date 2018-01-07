const _map = require("lodash/map");
const { applyPatch } = require("makitso-prompt/immutably");
const chalk = require("chalk");

function Validate() {
  return async function keyPress(state, press) {
    if (press.key.name === "return") {
      if (!state.prompt.command.hasAction) {
        state = applyPatch(state, {
          returnCommand: false
        });
      }
      const missing = state.prompt.command.input.missing || [];
      if (missing.length) {
        const args = _map(missing, arg => arg.name);
        const { name, description } = missing[0];
        state = applyPatch(state, {
          returnCommand: false,
          header: chalk`{yellow Missing Args: ${args.join(
            " "
          )}}\n{grey Enter a ${name} ${description ? `(${description})` : ""}}`
        });
      }
    }
    return state;
  };
}

exports = module.exports = Validate;
