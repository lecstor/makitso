const _forEach = require("lodash/forEach");

/**
 * returns a list of command argument names
 *
 * @param {String} appCmdArgs - the command args definition
 * @returns {String[]} a list of argument names
 */
function getArgNames(appCmdArgs) {
  if (!appCmdArgs) {
    return [];
  }
  return appCmdArgs.split(/\s+-\w/)[0].split(/\s+/);
}

/**
 * Assign positional args to relative keys
 *
 * @param {Object} args -
 * @param {Object} args.appCmd - a command definition
 * @param {Object} args.inputArgs - args parsed by yargs-parser
 * @returns {Object} args, missing, and unknown
 */
function applyArgNames(args) {
  const { appCmd, inputArgs } = args;
  const defWords = getArgNames(appCmd.args);
  const { _: inputPos, ...assignedInputArgs } = inputArgs;
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
  const result = { assignedInputArgs };
  if (missing.length) {
    result.missing = missing;
  }
  if (unknown.length) {
    result.unknown = unknown;
  }
  return result;
}

exports = module.exports = applyArgNames;
exports.getArgNames = getArgNames;
