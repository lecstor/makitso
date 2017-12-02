"use strict";

const commands = {
  quit: {
    action: () => {
      throw new Error("quit");
    }
  }
};

function plugin() {
  return commands;
}

module.exports = plugin;
