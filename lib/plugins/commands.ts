"use strict";

import { plugin as helpPlugin } from "./help";

const help = helpPlugin();

const commands = {
  quit: {
    description: "Exit this tool",
    action: () => {
      throw new Error("quit");
    },
  },
  ...help.commands,
};

function plugin() {
  return commands;
}

export { plugin };
