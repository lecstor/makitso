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
    if (!cmd) {
      return Object.keys(commands);
    }
    const { appCmd, cmdArgs } = cmd;
    if (appCmd.action) {
      if (!appCmd.choices) {
        return [];
      }
      if (typeof appCmd.choices === "function") {
        const input = parse({ appCmd, cmdArgs });
        return appCmd.choices({ context, input });
      } else {
        return appCmd.choices;
      }
    }
    return Object.keys(appCmd);
  };
}

exports = module.exports = autoCompleteFn;
