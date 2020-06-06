import _forEach from "lodash/forEach";

import { findCommand } from "../command/find";
import { Commands, Context, Input } from "../types";

function write(str: string) {
  console.log(str);
}

function printCommands(commands: Commands, prefix = "") {
  _forEach(commands, (command, name) => {
    write(
      `${prefix}${name} - ${command.description || "No description supplied"}`
    );
  });
}

async function action({ context, input }: { context: Context; input: Input }) {
  const { commands } = context;

  if (input.args.command && input.args.command.length) {
    const cmdLine = input.args.command.join(" ");
    const commandMeta = await findCommand({ cmdLine, commands });
    if (commandMeta) {
      const { appCmd } = commandMeta;
      if (appCmd.commands) {
        write(`\n  ${cmdLine} sub-commands:\n`);
        printCommands(appCmd.commands, `    `);
      } else {
        write(`\n  ${cmdLine} - ${appCmd.description}\n`);
        if (appCmd.arguments && appCmd.arguments.length) {
          write("    Arguments:");
          appCmd.arguments.forEach((arg) => write(`      ${arg}`));
        }
        if (appCmd.options && appCmd.options.length) {
          write("    Options:");
          appCmd.options.forEach((opt) => write(`      ${opt}`));
        }
      }
    }
  } else {
    write(`\n  Available commands:\n`);
    printCommands(commands, "    ");
  }
  write("");
}

async function suggest({ context, input }: { context: Context; input: Input }) {
  const { commands } = context;
  if (input.args.command && input.args.command.length) {
    const cmdLine = input.args.command.join(" ");
    const command = await findCommand({ cmdLine, commands });
    if (command) {
      const { appCmd } = command;
      if (appCmd.commands) {
        return Object.keys(appCmd.commands);
      }
      return [];
    }
  }
  return Object.keys(commands).filter((comm) => comm !== "help");
}

const commands = {
  help: {
    description: "Get some help using this tool",
    arguments: ["[command...] - a command to get help with"],
    action,
    suggest,
  },
};

export function plugin() {
  return { commands };
}
