const yargsParseArgs = require("yargs-parser");
const _forEach = require("lodash/forEach");

const debug = require("../debug");

/**
 * list missing args
 *
 * @param {Object} appCmd - command definition
 * @param {Array} positionalArgs from commandline
 * @returns {Array[]} missing args
 */
function findMissingArgs(appCmd, positionalArgs) {
  let missing = [];
  _forEach(appCmd.args, (arg, idx) => {
    if (!positionalArgs[idx]) {
      if (!arg.isOptional) {
        missing.push(arg);
      }
    }
  });
  return missing;
}

/**
 * clean and format options specified in the command
 *
 * @param {Object} appCmd - command definition
 * @param {Object} argv - options parsed from commandline
 * @returns {Object} argv and unknown options
 */
function processOptions(appCmd, argv) {
  const newArgv = {};
  let unknownOpts = [];
  _forEach(argv, (val, key) => {
    // don't add aliases
    if (!appCmd.aliasLookup[key]) {
      // ensure options are arrays unless boolean
      if (val !== true && val !== false) {
        val = Array.isArray(val) ? val : [val];
      }
      // classify unknown options
      if (appCmd.optsLookup[key] === undefined) {
        unknownOpts.push({ [key]: val });
      } else {
        newArgv[key] = val;
      }
    }
  });
  return { unknownOpts, args: newArgv };
}

/**
 * @typedef {Object} Args
 * @property {Array} missing - required arguments not provided
 * @property {Array} unknownArgs - arguments which do not exist in the command definition
 * @property {Array} unknownOpts - options which do not exist in the command definition
 * @property {Object} args - all valid arguments and options from commandline
 */

/**
 * parse command args and options
 *
 * @param {Object} appCmd - command definition
 * @param {String} cmdArgs - arguments and options from commandline
 * @param {Object} cmdLine - commandLine string
 * @returns {Args} the parsed commandline
 */
function parseArgs(appCmd, cmdArgs, cmdLine) {
  let parsed = yargsParseArgs.detailed(cmdArgs, appCmd.argsParserOpts);

  if (parsed.error) {
    throw parsed.error;
  }

  let { _: positionalArgs, ...args } = parsed.argv;

  // if positional args have no value they need to appear in missing
  let missing = findMissingArgs(appCmd, positionalArgs);

  let unknownOpts;
  ({ args, unknownOpts } = processOptions(appCmd, args));

  let unknownArgs = [];
  const lastIdx = appCmd.args ? appCmd.args.length - 1 : -1;
  const lastArg = lastIdx >= 0 ? appCmd.args[lastIdx] : {};
  // assign positional values
  _forEach(positionalArgs, (value, idx) => {
    if (appCmd.args && appCmd.args[idx]) {
      if (appCmd.args[idx].isMulti) {
        args[appCmd.args[idx].name] = [value];
      } else {
        args[appCmd.args[idx].name] = value;
      }
    } else if (lastArg.isMulti) {
      args[lastArg.name].push(value);
    } else {
      unknownArgs.push(value);
    }
  });

  let currentArg;
  if (lastIdx >= 0) {
    let idx = positionalArgs.length;
    if (idx && !/\s$/.test(cmdLine)) {
      idx--;
    }
    if (idx < appCmd.args.length) {
      currentArg = appCmd.args[idx].name;
    } else if (appCmd.args[lastIdx].isMulti) {
      currentArg = appCmd.args[lastIdx].name;
    }
  }

  const result = { args, missing, currentArg };
  if (unknownArgs.length) {
    result.unknownArgs = unknownArgs;
  }
  if (unknownOpts.length) {
    result.unknownOpts = unknownOpts;
  }
  return result;
}

/**
 *
 * @param {Object} arg0 -
 * @param {Object} arg0.appCmd - command definition
 * @param {String} arg0.cmdArgs - arguments and options input
 * @returns {Args} parsed args with validation
 */
function parse(arg0) {
  let { appCmd, cmdArgs, cmdLine } = arg0;
  debug({ appCmd, cmdArgs });
  const parsedArgs = parseArgs(appCmd, cmdArgs, cmdLine);
  debug({ parsedArgs });
  return parsedArgs;
}

exports = module.exports = parse;
