const yargsParseArgs = require("yargs-parser");

const _forEach = require("lodash/forEach");
const _trim = require("lodash/trim");
const _mapValues = require("lodash/mapValues");

function updateAliases(appCmd, argv) {
  const aliases = {};
  _forEach(appCmd.opts.alias, (alias, name) => {
    _forEach(alias, ali => {
      aliases[ali] = true;
    });
  });
  const slimArgv = {};
  _forEach(argv, (val, key) => {
    if (!aliases[key]) {
      slimArgv[key] = val;
    }
  });
  return slimArgv;
}

/**
 * returns a list of command argument names
 *
 * @param {String} appCmdArgs - the command args definition
 * @returns {String[]} a list of argument names
 */
function parseAppCmdArgs(appCmdArgs) {
  if (!appCmdArgs) {
    return { names: [] };
  }
  const names = _trim(appCmdArgs)
    .split(/\s+-\w/)[0]
    .split(/\s+/);
  const lastIdx = names.length - 1;
  let last = names[lastIdx];
  const optional = last.startsWith("[");
  const multi = /\[]/.test(last);
  names[lastIdx] = last.replace(/[[\]]/g, "");
  return { names, lastIdx, optional, multi };
}

function parseCommandDefinition(appCmd) {
  const { opts = {} } = appCmd;
  const { alias = {} } = opts;
  const appCmdArgs = parseAppCmdArgs(appCmd.args);

  // create positional arg index lookup object
  let argsLookup = {};
  _forEach(appCmdArgs.names, (name, idx) => {
    argsLookup[name] = idx;
  });

  const filteredAlias = _mapValues(alias, (value, name) => {
    if (!argsLookup[name]) {
      return value;
    }
  });

  return {
    args: appCmdArgs,
    argsLookup,
    opts: {
      ...opts,
      alias: filteredAlias
    }
  };
}

function parseArgs({ appCmd, cmdArgs }) {
  let parsed = yargsParseArgs.detailed(cmdArgs, appCmd.opts);

  if (parsed.error) {
    throw parsed.error;
  }

  let { _: positional, ...argv } = parsed.argv;

  // if any options have the same name as positional args then they
  // need to be moved to unknown.
  let unknown = [];

  // if positional args have no value they need to appear in missing
  let missing = [];

  // create positional arg index lookup object
  _forEach(appCmd.args.names, (name, idx) => {
    if (!positional[idx]) {
      if (!(idx === appCmd.args.lastIdx && appCmd.args.optional)) {
        missing.push(name);
      }
    }
  });

  // filter out options which are positional args
  const filteredArgv = {};
  _forEach(argv, (val, name) => {
    if (appCmd.argsLookup[name] !== undefined) {
      unknown.push({ [name]: val });
    } else {
      filteredArgv[name] = Array.isArray(val) ? val : [val];
    }
  });
  argv = filteredArgv;

  // assign positional values
  const argNames = appCmd.args.names;
  _forEach(positional, (value, idx) => {
    if (argNames[idx]) {
      if (idx === appCmd.args.lastIdx && appCmd.args.multi) {
        argv[argNames[idx]] = [value];
      } else {
        argv[argNames[idx]] = value;
      }
    } else if (appCmd.args.multi) {
      argv[argNames[appCmd.args.lastIdx]].push(value);
    } else {
      unknown.push(value);
    }
  });

  const result = { argv };
  if (missing.length) {
    result.missing = missing;
  }
  if (unknown.length) {
    result.unknown = unknown;
  }
  return result;
}

/**
 * @typedef {Object} Args
 * @property {Array} missing - required args not provided
 * @property {Array} unknown - values that don't fit in the command format
 * @property {Object} argv - all arg values
 */

/**
 *
 * @param {Object} arg0 -
 * @param {Object} arg0.appCmd - command definition
 * @param {String} arg0.cmdArgs - arguments and options input
 * @returns {Args} parsed args with validation
 */
function parse(arg0) {
  let { appCmd, cmdArgs } = arg0;
  appCmd = parseCommandDefinition(appCmd);
  let { argv, ...result } = parseArgs({ appCmd, cmdArgs });
  argv = updateAliases(appCmd, argv);
  return { ...result, args: argv };
}

exports = module.exports = parse;
