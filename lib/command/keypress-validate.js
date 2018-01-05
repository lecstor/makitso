const { applyPatch } = require("makitso-prompt/immutably");

function Validate(helper) {
  return async function keyPress(state, press) {
    if (state.mode.command) {
      let command = state.prompt.command.text;
      let help = await helper(command);
      debug({ help1: help });
      if (press.key.name === "tab" && help.choices.length) {
        // set last word of commandline to the prefix common to all choices
        command = completedCommandPortion(command);
        let text;
        if (help.choices.length === 1) {
          text = `${command}${help.choices[0]} `;
        } else {
          const prefix = findCommonPrefix(help.choices);
          text = `${command}${prefix}`;
        }
        help = await helper(text);
        debug({ help2: help });
        state = applyPatch(state, {
          prompt: {
            command: { text },
            cursor: { col: null }
          }
        });
      }
      if (help.choices.length) {
        state = applyPatch(state, { footer: help.choices.join(" ") });
      } else if (help.description) {
        state = applyPatch(state, { footer: help.description });
      }
    }
    return state;
  };
}

exports = module.exports = Validate;
