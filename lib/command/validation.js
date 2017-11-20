const assignPositionalArgs = require("./args");
const findCommand = require("./find");

/**
 * Validate command arguments
 *
 * @param {Object} args -
 * @param {Object} args.appCmd - a command definition
 * @param {Object} args.inputArgs - args parsed by yargs-parser
 * @returns {Boolean} is valid
 */
function validateCommandArgs(args) {
  const { appCmd, inputArgs } = args;
  const { missing, unknown } = assignPositionalArgs({
    appCmd,
    inputArgs
  });
  if (unknown) {
    return `Too Many Args, we don't know what these values are for; "${unknown.join(
      '", "'
    )}"`;
  }
  if (missing.length) {
    return `Missing required command argument${
      missing.length > 1 ? "s" : ""
    }; ${missing.join('", "')}`;
  }
  return true;
}

/**
 * get a command validation function
 *
 * @param {Object} args -
 * @param {Object} args.appCommands - the app commands definition
 * @returns {Function} command validation
 */
function validateFn(args) {
  const { appCommands } = args;
  /**
   * Validate a command from the commandline
   *
   * @param {String} cmdLine - the command to validate
   * @returns {Boolean} is valid
   */
  return async cmdLine => {
    if (cmdLine === "") {
      return true;
    }
    const { cmdPath, inputArgs, appCmd } = await findCommand({
      cmdLine,
      appCommands
    });
    if (!appCmd) {
      return "Unknown Command";
    }
    if (!appCmd.action) {
      return "You'll need to add a sub-command, Hit [Tab] to see the options";
    }
    if (!appCmd.args) {
      if (inputArgs["_"].length || Object.keys(inputArgs).length > 1) {
        const cmdStr = cmdPath.join(" ");
        return `"${
          cmdStr
        }" doesn't take any args, did you mean something else?`;
      }
      return true;
    }
    return validateCommandArgs({ appCmd, inputArgs });
  };
}

exports = module.exports = validateFn;
