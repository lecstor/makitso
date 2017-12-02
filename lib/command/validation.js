const parse = require("./args");
const findCommand = require("./find");

/**
 * get a command validation function
 *
 * @param {Object} args -
 * @param {Object} args.commands - the app commands definition
 * @returns {Function} command validation
 */
function validateFn(args) {
  const { commands } = args;
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
    const cmd = await findCommand({
      cmdLine,
      commands
    });
    if (!cmd) {
      return true;
    }
    const { appCmd, cmdArgs } = cmd;
    if (!appCmd.action) {
      return "You'll need to add a sub-command, Hit [Tab] to see the options";
    }
    const { missing, unknown } = parse({ appCmd, cmdArgs });
    if (unknown) {
      return `Too Many Args. Could not parse: "${unknown.join('", "')}"`;
    }
    if (missing) {
      return `Missing required command argument${
        missing.length > 1 ? "s" : ""
      }; ${missing.join('", "')}`;
    }
    return true;
  };
}

exports = module.exports = validateFn;
