"use strict";

const _forEach = require("lodash/forEach");
const _filter = require("lodash/filter");
const _trim = require("lodash/trim");

const parseArgs = require("yargs-parser");
const inquirer = require("inquirer");
const iPrompt = require("./prompt");
const chalk = require("chalk").default;

inquirer.registerPrompt("custom", iPrompt);
const prompt = inquirer.prompt;

const True = () => true;

/**
 *
 * @param {Object} context - an instance of Context
 * @param {Error} err - an Error
 * @returns {void}
 */
function logError(context, err) {
  console.log(chalk.green("Error: "), err.message);
  if (context.debug || process.env.MAKITSO_DEBUG) {
    console.error(err);
  }
}

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
    return {};
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
  const inputArgs = parseArgs(words);
  if (appCmd === appCommands) {
    return { inputArgs };
  }
  return { appCmd, cmdPath, inputArgs };
}

function autoCompleteFn({ appCommands }) {
  return async cmdLine => {
    const { appCmd, inputArgs } = await findCommand({ cmdLine, appCommands });
    if (!appCmd) {
      return Object.keys(appCommands);
    }
    if (appCmd.action) {
      if (appCmd.args) {
        const opt = appCmd.args.split(" ")[0].replace(/[\\[\]]/g, "");
        if (!appCmd.choices || !appCmd.choices[opt]) {
          return [];
        }
        if (typeof appCmd.choices[opt] === "function") {
          return appCmd.choices[opt](inputArgs);
        }
        return appCmd.choices[opt];
      } else {
        return [];
      }
    }
    return Object.keys(appCmd);
  };
}

/**
 *
 * @param {String} args
 */
function validateCommandArgs({ appCmd, inputArgs }) {
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

function validateFn({ appCommands }) {
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

async function commandPrompt(args) {
  const { complete, validate, options = {} } = args;
  const { message = "CommandIt>" } = options;
  const { cmdLine } = await prompt({
    type: "custom",
    name: "cmdLine",
    message,
    autoCompletion: complete,
    validate
  });
  return cmdLine;
}

/**
 * Prompt the user for a command and run it
 *
 * @param {Object} args -
 * @param {Object} args.context - An instance of context
 * @param {Object} args.commands - app commands
 * @param {Object} args.options - app options
 * @param {Function|Array} [args.complete=[]] - prompt autocomplete
 * @param {Function} [args.validate] - prompt validation
 * @returns {void}
 */
async function promptAndRun(args) {
  const { context, appCommands, complete = [], validate = True } = args;
  const options = args.options.prompt;
  try {
    const cmdLine = await commandPrompt({ complete, validate, options });
    const { inputArgs, appCmd } = await findCommand({ cmdLine, appCommands });
    if (appCmd) {
      const { assignedInputArgs } = assignPositionalArgs({
        appCmd,
        inputArgs
      });
      await appCmd.action(context, assignedInputArgs);
    }
  } catch (error) {
    logError(context, error);
  }
  promptAndRun(args);
}

async function start({ context, commands, options }) {
  const complete = autoCompleteFn({ appCommands: commands });
  const validate = validateFn({ appCommands: commands });
  promptAndRun({ context, appCommands: commands, options, complete, validate });
}

module.exports = start;
