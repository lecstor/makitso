"use strict";

import { Prompt, keyPressHistory } from "makitso-prompt";

import { debug } from "../debug";
import { parse } from "./args";
import { findCommand } from "./find";
import { Autocomplete } from "./keypress-autocomplete";
import { AutoHelp } from "./keypress-autohelp";
import { keyPressCommandInfo } from "./keypress-command-info";
import { keyPressValidate } from "./keypress-validate";

import { ContextSchema, Defs } from "../types";

type RunCommandLineArgs = {
  context: ContextSchema;
  commands: Defs;
  cmdLine: string;
};

async function runCommandLine(args: RunCommandLineArgs): Promise<Error | void> {
  const { context, commands, cmdLine } = args;
  debug({ cmdLine });
  const cmd = await findCommand({ cmdLine, commands });
  if (cmd) {
    const { appCmd, cmdArgs } = cmd;
    const input = parse({ appCmd, cmdArgs });
    debug({ appCmd, cmdArgs, input });
    if (appCmd.action) {
      await appCmd.action({ commands, context, command: appCmd, input });
    }
  }
}

type Args = {
  context: ContextSchema;
  commands: Defs;
  prompt: Prompt;
};

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
async function promptAndRun(args: Args): Promise<Error | void> {
  const { context, commands, prompt } = args;
  try {
    const cmdLine = `${await prompt.start()}`;
    debug({ cmdLine });
    const cmd = await findCommand({ cmdLine, commands });
    if (cmd) {
      const { appCmd, cmdArgs } = cmd;
      const input = parse({ appCmd, cmdArgs });
      debug({ appCmd, cmdArgs, input });
      if (appCmd.action) {
        await appCmd.action({ commands, context, command: appCmd, input });
      }
    }
    return promptAndRun(args);
  } catch (error) {
    if (error.message !== "quit") {
      return Promise.reject(error);
    }
  }
}

function initCommandPrompt({ context, commands, prompt }: Args) {
  const commandInfo = keyPressCommandInfo({ context, commands });

  const keyPressParser = {
    keyPress: commandInfo,
  };

  const keyPressAutocomplete = {
    keyPress: Autocomplete({ commandInfo }),
  };

  const keyPressAutoHelp = {
    keyPress: AutoHelp(),
  };

  const keyPressValidator = {
    keyPress: keyPressValidate(),
  };

  Object.assign(prompt, {
    keyPressers: [
      {
        async keyPress(state: any) {
          debug("keyPresser1", state);
          return state;
        },
      },
      ...prompt.keyPressers,
      keyPressHistory,
      keyPressParser,
      keyPressAutocomplete,
      keyPressAutoHelp,
      keyPressValidator,
    ],
  });

  return prompt;
}

type StartArgs = {
  context: ContextSchema;
  commands: Defs;
  prompt: Prompt;
  cmdLine?: string;
};

/**
 * Start the console app
 *
 * @param {Object} args -
 * @param {Object} args.context - An instance of context
 * @param {Object} args.commands - app commands
 * @returns {void}
 */
export async function start(args: StartArgs) {
  const { context, commands, prompt, cmdLine } = args;

  if (cmdLine) {
    return runCommandLine({ context, commands, cmdLine });
  }

  initCommandPrompt({ context, commands, prompt });

  process.on("SIGINT", function () {
    console.log("Interrupted");
    console.log(prompt.state);
    if (!prompt.state.pojo.returnCommand) {
      process.exit();
    }
  });

  return promptAndRun({ context, commands, prompt });
}
