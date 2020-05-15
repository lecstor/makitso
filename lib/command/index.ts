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

type Args = {
  context: ContextSchema;
  commands: Defs;
  prompt: Prompt;
};

/**
 * Prompt the user for a command and run it
 *
 * @param {Object} arg0 -
 * @param {Object} arg0.context - An instance of context
 * @param {Object} arg0.commands - app commands
 * @param {Object} arg0.options - app options
 * @param {Function|Array} [arg0.complete=[]] - prompt autocomplete
 * @param {Function} [arg0.validate] - prompt validation
 * @returns {void}
 */
async function promptAndRun(arg0: Args): Promise<Error | void> {
  const { context, commands, prompt } = arg0;
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
    return promptAndRun(arg0);
  } catch (error) {
    if (error.message !== "quit") {
      return Promise.reject(error);
    }
  }
}

function initCommandPrompt({ context, commands, prompt }: Args) {
  const commandInfo = keyPressCommandInfo({ context, commands });

  const keyPressParser = {
    keyPress: commandInfo
  };

  const keyPressAutocomplete = {
    keyPress: Autocomplete({ commandInfo })
  };

  const keyPressAutoHelp = {
    keyPress: AutoHelp()
  };

  const keyPressValidator = {
    keyPress: keyPressValidate()
  };

  Object.assign(prompt, {
    keyPressers: [
      {
        async keyPress(state: any) {
          debug("keyPresser1", state);
          return state;
        }
      },
      ...prompt.keyPressers,
      keyPressHistory,
      keyPressParser,
      keyPressAutocomplete,
      keyPressAutoHelp,
      keyPressValidator
    ]
  });

  return prompt;
}

/**
 * Start the console app
 *
 * @param {Object} arg0 -
 * @param {Object} arg0.context - An instance of context
 * @param {Object} arg0.commands - app commands
 * @returns {void}
 */
export async function start(arg0: Args) {
  const { context, commands, prompt } = arg0;

  initCommandPrompt({ context, commands, prompt });

  process.on("SIGINT", function() {
    console.log("Interrupted");
    console.log(prompt.state);
    if (!prompt.state.pojo.returnCommand) {
      process.exit();
    }
  });

  return promptAndRun({ context, commands, prompt });
}
