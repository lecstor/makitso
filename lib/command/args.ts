import yargsParseArgs from "yargs-parser";
import _forEach from "lodash/forEach";

import { debug } from "../debug";

import { Argument, Def, ParsedArgs, YargsParserArguments } from "../types";

/**
 * list missing args
 *
 * @param {Object} appCmd - command definition
 * @param {Array} positionalArgs from commandline
 * @returns {Array[]} missing args
 */
function findMissingArgs(appCmd: Def, positionalArgs: string[]) {
  const missing: Argument[] = [];
  _forEach(appCmd.args, (arg, idx) => {
    if (!positionalArgs[idx]) {
      if (!arg.isOptional) {
        missing.push(arg);
      }
    }
  });
  return missing;
}

type ArgV = Omit<YargsParserArguments, "_" | "$0">;

/**
 * clean and format options specified in the command
 *
 * @param {Object} appCmd - command definition
 * @param {Object} argv - options parsed from commandline
 * @returns {Object} argv and unknown options
 */
function processOptions(appCmd: Def, argv: ArgV) {
  // console.log("processOptions", JSON.stringify({ appCmd, argv }, null, 2));
  const newArgv: ArgV = {};
  const unknownOpts: ArgV[] = [];
  _forEach(argv, (val, key) => {
    // don't add aliases
    if (!appCmd.aliasLookup?.[key]) {
      // ensure options are arrays unless boolean
      if (val !== true && val !== false) {
        val = Array.isArray(val) ? val : [val];
      }
      // classify unknown options
      if (appCmd.optsLookup?.[key] === undefined) {
        unknownOpts.push({ [key]: val });
      } else {
        newArgv[key] = val;
      }
    }
  });
  return { unknownOpts, args: newArgv };
  // return { unknownOpts, options: newArgv };
}

/**
 *
 * @param {Number} argCount - the number of args on commandline
 * @param {Boolean} nextArg - true if the last arg on commandline is complete
 * @param {Array} argsDef - the command arguments definition
 * @returns {String} the current arg
 */
function getCurrentArg(
  argCount: number,
  nextArg: boolean,
  argsDef?: Argument[]
) {
  let current;
  if (argsDef && argsDef.length) {
    const lastIdx = argsDef.length - 1;
    let idx = argCount;
    if (idx && !nextArg) {
      idx--;
    }
    if (idx < argsDef.length) {
      current = argsDef[idx].name;
    } else if (argsDef[lastIdx].isMulti) {
      current = argsDef[lastIdx].name;
    }
  }
  return current;
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
 * @param {String} cmdLine - commandLine string
 * @returns {Args} the parsed commandline
 */
function parseArgs(appCmd: Def, cmdArgs: string, cmdLine = "") {
  const parsed = yargsParseArgs.detailed(cmdArgs, appCmd.argsParserOpts);

  if (parsed.error) {
    throw parsed.error;
  }
  // eslint-disable-next-line prefer-const
  // let { _: positionalArgs, ...args } = parsed.argv;
  // eslint-disable-next-line prefer-const
  let { _: positionalArgs, $0: script, ...args } = parsed.argv;

  // if positional args have no value they need to appear in missing
  const missing = findMissingArgs(appCmd, positionalArgs);

  let unknownOpts;
  // eslint-disable-next-line prefer-const
  ({ args, unknownOpts } = processOptions(appCmd, args));
  // eslint-disable-next-line prefer-const
  // let { options, unknownOpts } = processOptions(appCmd, args);

  const unknownArgs: string[] = [];
  const lastIdx = appCmd.args ? appCmd.args.length - 1 : -1;
  const lastArg =
    lastIdx >= 0 && appCmd.args?.[lastIdx]
      ? appCmd.args[lastIdx]
      : { isMulti: false, name: "" };
  // assign positional values
  _forEach(positionalArgs, (value, idx) => {
    if (appCmd.args && appCmd.args[idx]) {
      if (appCmd.args[idx].isMulti) {
        args[appCmd.args[idx].name] = [value];
      } else {
        args[appCmd.args[idx].name] = value;
      }
    } else if (lastArg?.isMulti) {
      // if (Array.isArray(args[lastArg.name])) {
      args[lastArg.name].push(value);
    } else {
      //     args[lastArg.name] = value;
      //   }
      // } else {
      unknownArgs.push(value);
    }
  });

  const argCount = positionalArgs.length;
  const nextArg = /\s$/.test(cmdLine);
  const current = getCurrentArg(argCount, nextArg, appCmd.args);

  const result: ParsedArgs = { args, missing, current };
  // const result: ParsedArgs = { args, opts: options, missing, current };
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
export function parse(arg0: {
  appCmd: Def;
  cmdArgs: string;
  cmdLine?: string;
}) {
  const { appCmd, cmdArgs, cmdLine } = arg0;
  debug({ appCmd, cmdArgs });
  const parsedArgs = parseArgs(appCmd, cmdArgs, cmdLine);
  debug({ parsedArgs });
  return parsedArgs;
}
