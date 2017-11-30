const _filter = require("lodash/filter");
const findCommand = require("./find");
const parse = require("./args");

/**
 * get an autocomplete options function
 *
 * @param {Object} args -
 * @param {Object} args.commands - app commands definition
 * @returns {Function} autocomplete
 */
function autoCompleteFn({ context, commands }) {
  /**
   * get possible choices for autocomplete
   *
   * @param {String} cmdLine - the command to complete
   * @returns {Array} list of choices
   */
  return async cmdLine => {
    const cmd = await findCommand({ cmdLine, commands });
    let choices = Object.keys(commands);
    if (cmd) {
      const { appCmd, cmdArgs } = cmd;
      choices = Object.keys(appCmd);
      if (appCmd.action) {
        if (!appCmd.choices) {
          return [];
        }
        if (typeof appCmd.choices === "function") {
          const input = parse({ appCmd, cmdArgs });
          choices = appCmd.choices({ context, input });
        } else {
          choices = appCmd.choices;
        }
      }
    }
    const filter = cmd ? cmd.cmdArgsList.pop() : cmdLine;
    if (!filter) {
      return choices;
    }
    const matches = _filter(choices, choice => choice.startsWith(filter));
    if (matches.length) {
      return matches;
    }
    return choices;
  };
}

exports = module.exports = autoCompleteFn;
