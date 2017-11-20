const _filter = require("lodash/filter");
const _forEach = require("lodash/forEach");

/**
 * returns a list of command argument names
 *
 * @param {String} appCmdArgs - the command args definition
 * @returns {String[]} a list of argument names
 */
function getPositionalArgNames(appCmdArgs) {
  if (!appCmdArgs) {
    return [];
  }
  return _filter(appCmdArgs.split(" "), word => !/^-/.test(word));
}

/**
 * Assign positional args to relative keys
 *
 * @param {Object} args -
 * @param {Object} args.appCmd - a command definition
 * @param {Object} args.inputArgs - args parsed by yargs-parser
 * @returns {Object} args, missing, and unknown
 */
function assignPositionalArgs(args) {
  const { appCmd, inputArgs } = args;
  const defWords = getPositionalArgNames(appCmd.args);
  const inputPos = inputArgs["_"];
  const assignedInputArgs = {};
  let optional;
  let unknown = [];
  let missing = [];
  const lastArgName = defWords[defWords.length - 1];

  if (/^\[/.test(lastArgName)) {
    optional = lastArgName.replace(/[\\[\]]/g, "");
    defWords[defWords.length - 1] = optional;
  }
  _forEach(defWords, (word, idx) => {
    if (!inputPos[idx]) {
      if (word !== optional) {
        missing.push(word);
      }
      return true;
    }
    assignedInputArgs[word] = inputPos[idx];
  });
  if (inputPos.length > defWords.length) {
    _forEach(inputPos, (word, idx) => {
      if (!defWords[idx]) {
        unknown.push(word);
      }
    });
  }
  return {
    assignedInputArgs,
    missing,
    unknown: unknown.length ? unknown : undefined
  };
}

exports = module.exports = assignPositionalArgs;
