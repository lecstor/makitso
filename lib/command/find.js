const _forEach = require("lodash/forEach");
const _trim = require("lodash/trim");

/**
 * returns the deepest possible command for the cmdLine string
 * It may be a command with subcommands that it returns
 *
 * @param {Object} arg0 -
 * @param {Object} arg0.cmdLine -
 * @param {Object} arg0.commands - app commands definition
 * @returns {Object} { appCmd, cmdPath, cmdArgs }
 */
async function findCommand(arg0) {
  const { cmdLine, commands } = arg0;
  const cleanCmdLine = _trim(cmdLine);
  if (!cleanCmdLine) {
    return;
  }
  const words = cleanCmdLine.split(/\s+/);
  let appCmd = commands;
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
  if (appCmd === commands) {
    return;
  }
  return { appCmd, cmdPath, cmdArgs: words.join(" "), cmdArgsList: words };
}

exports = module.exports = findCommand;
