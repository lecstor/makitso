import _filter from "lodash/filter";
import { State } from "makitso-prompt";

import { parse } from "./args";
import { findCommand } from "./find";

import { debug } from "../debug";

import { CommandInfo, CommandInfoArgs } from "../types";

function getSuggests(obj: { [key: string]: unknown }) {
  return _filter(Object.keys(obj), (choice) => !choice.startsWith("_"));
}

export function keyPressCommandInfo({ context, commands }: CommandInfoArgs) {
  return async function keyPress(state: State) {
    const cmdLine = state.command;
    const cmd = await findCommand({ cmdLine, commands });

    const info: CommandInfo = {};

    if (cmd) {
      const { appCmd, cmdArgs } = cmd;
      // info.description = appCmd._description || appCmd.description;
      info.description = appCmd.description;
      info.opts = appCmd.opts;
      info.args = appCmd.args;
      info.suggests = getSuggests(appCmd.commands || appCmd);
      info.help = null;
      if (!appCmd.commands) {
        info.input = parse({ appCmd, cmdArgs, cmdLine });
        info.hasAction = true;
        if (!appCmd.suggest) {
          info.suggests = [];
        } else {
          debug({ suggestsFn: typeof appCmd.suggest });
          if (typeof appCmd.suggest === "function") {
            debug(["appCmd.suggest", appCmd.suggest.toString()]);
            info.suggests = await appCmd.suggest({
              context,
              command: appCmd,
              input: info.input,
            });
            debug(["command.suggests", info.suggests]);
          } else {
            info.suggests = appCmd.suggest;
          }
        }
        if (!appCmd.help) {
          info.helps = [];
        } else {
          debug({ helpsFn: typeof appCmd.help });
          if (typeof appCmd.help === "function") {
            debug(["appCmd.help", appCmd.help.toString()]);
            info.help = await appCmd.help({
              context,
              command: appCmd,
              input: info.input,
            });
            debug(["command.helps", info.help]);
          } else {
            info.help = appCmd.help;
          }
        }
      }
    } else {
      info.suggests = getSuggests(commands);
    }

    debug({ cmd, cmdLine: `"${cmdLine}"` });
    let filter = "";
    if (!/\s$/.test(cmdLine)) {
      filter = (cmd ? cmd.cmdArgsList.pop() : cmdLine) || "";
    }
    if (filter) {
      const matches = _filter(info.suggests, (choice) =>
        choice.startsWith(filter)
      );
      if (matches.length) {
        info.suggests = matches;
      }
    }
    // state.commandLine({ info });
    state.stash.info = info;
  };
}
