"use strict";

const Help = require("./help");

const help = Help();

const commands = {
  quit: {
    description: "Exit this tool",
    action: () => {
      throw new Error("quit");
    }
  },
  ...help.commands
};

function plugin() {
  return commands;
}

module.exports = plugin;
