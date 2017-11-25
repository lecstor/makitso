const findCommand = require("./find");
const parse = require("./args");

/**
 * get an autocomplete options function
 *
 * @param {Object} args -
 * @param {Object} args.appCommands - app commands definition
 * @returns {Function} autocomplete
 */
function autoCompleteFn({ context, appCommands }) {
  /**
   * get possible choices for autocomplete
   *
   * @param {String} cmdLine - the command to complete
   * @returns {Array} list of choices
   */
  return async cmdLine => {
    const cmd = await findCommand({ cmdLine, appCommands });
    if (!cmd) {
      return Object.keys(appCommands);
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
