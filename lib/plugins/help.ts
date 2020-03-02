"use strict";

const _forEach = require("lodash/forEach");

const findCommand = require("../command/find");

function write(str) {
  console.log(str);
}

function printCommands(commands, prefix = "") {
  _forEach(commands, (command, name) => {
    write(
      `${prefix}${name} - ${command.description || "No description supplied"}`
    );
  });
}

async function action({ context, input }) {
  const { commands } = context;

  if (input.args.command && input.args.command.length) {
    const cmdLine = input.args.command.join(" ");
    const command = await findCommand({ cmdLine, commands });
    const { appCmd } = command;
    if (appCmd.commands) {
      write(`\n  ${cmdLine} sub-commands:\n`);
      printCommands(appCmd.commands, `    `);
    } else {
      write(`\n  ${cmdLine} - ${appCmd.description}\n`);
      if (appCmd.arguments && appCmd.arguments.length) {
        write("    Arguments:");
        appCmd.arguments.forEach(arg => write(`      ${arg}`));
      }
      if (appCmd.options && appCmd.options.length) {
        write("    Options:");
        appCmd.options.forEach(opt => write(`      ${opt}`));
      }
    }
  } else {
    write(`\n  Available commands:\n`);
    printCommands(commands, "    ");
  }
  write("");
}

async function suggest({ context, input }) {
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
  return Object.keys(commands).filter(comm => comm !== "help");
}

const commands = {
  help: {
    description: "Get some help using this tool",
    arguments: ["[command...] - a command to get help with"],
    action,
    suggest
  }
};

function plugin() {
  return { commands };
}

module.exports = plugin;
