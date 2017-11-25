const _forEach = require("lodash/forEach");
const _trim = require("lodash/trim");

/**
 * returns the deepest possible command for the cmdLine string
 * It may be a command with subcommands that it returns
 *
 * @param {Object} args -
 * @param {Object} args.cmdLine -
 * @param {Object} args.appCommands - app commands definition
 * @returns {Object} { appCmd, cmdPath, cmdArgs }
 */
async function findCommand(args) {
  const { cmdLine, appCommands } = args;
  const cleanCmdLine = _trim(cmdLine);
  if (!cleanCmdLine) {
    return;
  }
  const words = cleanCmdLine.split(/\s+/);
  let appCmd = appCommands;
  let cmdPath = [];

  _forEach([...words], word => {
    if (appCmd.action) {
      return false; // there are no sub-commands
    }
    if (!appCmd[word]) {
      return false; // partial command or arg
    }
    cmdPath.push(words.shift());
    appCmd = appCmd[word];
  });
  if (appCmd === appCommands) {
    return;
  }
  return { appCmd, cmdPath, cmdArgs: words.join(" ") };
}

exports = module.exports = findCommand;
