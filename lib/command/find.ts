import _forEach from "lodash/forEach";
import _trim from "lodash/trim";

import { Def, Defs } from "../types";

/**
 * returns the deepest possible command for the cmdLine string
 * It may be a command with subcommands that it returns
 *
 * @param {Object} arg0 -
 * @param {Object} arg0.cmdLine -
 * @param {Object} arg0.commands - app commands definition
 * @returns {Object} { appCmd, cmdPath, cmdArgs }
 */
type Args = {
  cmdLine: string;
  commands: Defs;
};

export type CommandMeta = {
  appCmd: Def;
  cmdPath: string[];
  cmdArgs: string;
  cmdArgsList: string[];
};

export async function findCommand(arg0: Args): Promise<CommandMeta | void> {
  const { cmdLine, commands } = arg0;
  const cleanCmdLine = _trim(cmdLine);
  if (!cleanCmdLine) {
    return;
  }
  const words: string[] = cleanCmdLine.split(/\s+/);
  let appCmd: Partial<Def> = { commands };
  const cmdPath: string[] = [];

  _forEach([...words], word => {
    if (!appCmd.commands) {
      return false; // there are no sub-commands
    }
    if (!appCmd.commands[word]) {
      return false; // partial command or arg
    }
    cmdPath.push(word);
    words.shift();
    appCmd = appCmd.commands[word];
  });

  if (appCmd.commands === commands) {
    return;
  }

  return {
    appCmd,
    cmdPath,
    cmdArgs: words.join(" "),
    cmdArgsList: words
  };
}
