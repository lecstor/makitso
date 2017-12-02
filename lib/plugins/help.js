"use strict";

function help({ context, commands, args }) {}

const commands = {
  help: {
    args: "command[]",
    action: help
  }
};

function plugin() {
  return commands;
}

module.exports = plugin;
