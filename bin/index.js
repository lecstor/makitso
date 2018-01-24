#! /usr/bin/env node

"use strict";

const path = require("path");
const os = require("os");
const chalk = require("chalk");

const _includes = require("lodash/includes");

const Makitso = require("../");
const tunnelPlugin = require("makitso-tunnelblick2fa-plugin").plugin();
const developPlugin = require("makitso-develop-plugin").plugin();

const schema = {
  my: {
    name: {
      store: "file",
      ask: {
        header: `We'll only ask once..`,
        prompt: `{variant} name> `,
        footer: `Run this command again when you're done.`,
        storedValueIs: "response"
      }
    }
  },

  prompt: {
    withDefault: {
      // if there is a stored value, does not prompt
      store: "file",
      ask: {
        header: `A prompt with set default..`,
        prompt: `prompt> `,
        default: "help",
        storedValueIs: "response"
      }
    },
    valueDefault: {
      // always prompts
      store: "file",
      ask: {
        header: `A prompt with value as default..`,
        prompt: `prompt> `,
        storedValueIs: "default"
      }
    },
    valueDefaultWithDefault: {
      // always prompts
      store: "file",
      ask: {
        header: `A prompt with values default or set default..`,
        prompt: `prompt> `,
        default: "help",
        storedValueIs: "default"
      }
    },
    always: {
      // always prompts
      store: "file",
      ask: {
        header: `A prompt with set default..`,
        prompt: `prompt> `,
        default: "help"
      }
    }
  }
};

const commands = {
  demo: {
    description: "Some demos to try",
    commands: {
      printName: {
        description: "Get and print full name",
        action: async ({ context }) => {
          const firstName = await context.get("my.name.first");
          const lastName = await context.get("my.name.last");
          console.log(`${firstName} ${lastName}`);
        }
      },

      promptWDefault: {
        description: "A prompt with set default..",
        action: async ({ context }) => {
          const command = await context.get("prompt.withDefault");
          console.log(`${command}`);
        }
      },
      promptVDefault: {
        description: "A prompt with value as default..",
        action: async ({ context }) => {
          const command = await context.get("prompt.valueDefault");
          console.log(`${command}`);
        }
      },
      promptVDefaultWDefault: {
        description: "A prompt with value as default or set default..",
        action: async ({ context }) => {
          const command = await context.get("prompt.valueDefaultWithDefault");
          console.log(`${command}`);
        }
      },
      parseArgs: {
        description: "Test some args and options parsing",
        arguments: [
          "firstname - your first name",
          "lastname - your last name",
          "age - your real age",
          "rank - your rank",
          "[likes...] things you like"
        ],
        options: ["-d --doe a dear", "-f --far a long way"],
        action: async ({ context, input }) => {
          console.log(input);
        },
        choices: async ({ context, input }) => {
          if (!input.args.fname) {
            return [];
          }
          if (!input.args.sname) {
            return [];
          }
          if (!input.args.age) {
            return [];
          }
          const ranks = ["Colonel", "Lieutenant", "Major"];
          if (!_includes(ranks, input.args.rank)) {
            return ranks;
          }
          if (!input.args.likes || !input.args.likes.length) {
            return ["What you like"];
          }
        }
      }
    }
  }
};

const localPlugin = { schema, commands };

const options = {
  app: {
    version: "0.0.1",
    description:
      "Makitso - A Framework for building composable interactive commandline apps"
  },
  prompt: chalk`{blue Makitso> }`
};

const Plugins = Makitso.Plugins;
const appName = path.basename(process.argv[1]);
const makitso = Makitso({ options });
makitso
  .registerPlugins(
    Plugins({
      file: { path: path.join(os.homedir(), `/.${appName}.json`), data: {} },
      session: { data: {} }
    }),
    localPlugin,
    tunnelPlugin,
    developPlugin
  )
  .then(() => makitso.start())
  .then(() => {
    console.log("Goodbye!");
  })
  .catch(console.error);
