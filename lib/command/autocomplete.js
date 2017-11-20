const findCommand = require("./find");

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
    const { appCmd, inputArgs } = await findCommand({ cmdLine, appCommands });
    if (!appCmd) {
      return Object.keys(appCommands);
    }
    if (appCmd.action) {
      if (appCmd.args) {
        const opt = appCmd.args.split(" ")[0].replace(/[\\[\]]/g, "");
        if (!appCmd.choices || !appCmd.choices[opt]) {
          return [];
        }
        if (typeof appCmd.choices[opt] === "function") {
          return appCmd.choices[opt]({ context, inputArgs });
        }
        return appCmd.choices[opt];
      } else {
        return [];
      }
    }
    return Object.keys(appCmd);
  };
}

exports = module.exports = autoCompleteFn;
