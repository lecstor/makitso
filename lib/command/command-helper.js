const _filter = require("lodash/filter");
const findCommand = require("./find");
const parse = require("./args");
const debug = require("../debug");
/**
 * get a command helper function
 *
 * @param {Object} args -
 * @param {Object} args.context - app context instance
 * @param {Object} args.commands - app commands definition
 * @returns {Function} helper
 */
function commandHelperFn({ context, commands }) {
  /**
   * get command metadata for help info
   *
   * @param {String} cmdLine - the command to complete
   * @returns {Object} command metadata
   */
  return async cmdLine => {
    const cmd = await findCommand({ cmdLine, commands });
    debug({ cmdLine, cmd });

    let help = {};

    help.choices = _filter(
      Object.keys(commands),
      choice => !choice.startsWith("_")
    );

    if (cmd) {
      const { appCmd, cmdArgs } = cmd;
      help.description = appCmd._description || appCmd.description;
      help.options = appCmd.options;
      help.args = appCmd.args;

      help.choices = _filter(
        Object.keys(appCmd),
        choice => !choice.startsWith("_")
      );

      if (appCmd.action) {
        help.input = parse({ appCmd, cmdArgs });
        help.hasAction = true;
        if (!appCmd.choices) {
          help.choices = [];
        } else {
          if (typeof appCmd.choices === "function") {
            help.choices = await appCmd.choices({ context, input: help.input });
          } else {
            help.choices = appCmd.choices;
          }
        }
      }
    }

    const filter = cmd ? cmd.cmdArgsList.pop() : cmdLine;
    if (filter) {
      const matches = _filter(help.choices, choice =>
        choice.startsWith(filter)
      );
      if (matches.length) {
        help.choices = matches;
      }
    }

    return help;
  };
}

exports = module.exports = commandHelperFn;
