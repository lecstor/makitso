#! /usr/bin/env node

"use strict";

const path = require("path");
const os = require("os");

const Makitso = require("../");
const tunnelPlugin = require("makitso-tunnelblick2fa-plugin").plugin();
const developPlugin = require("makitso-develop-plugin").plugin();

const localPlugin = {
  schema: {
    my: {
      name: {
        store: "file",
        prompt: {
          type: "input",
          name: "name",
          message: `Enter your {variant} name ...`
        }
      }
    }
  },
  commands: {
    printName: {
      description: "Print your name",
      action: async ({ context }) => {
        const firstName = await context.get("my.name.first");
        const lastName = await context.get("my.name.last");
        console.log(`${firstName} ${lastName}`);
      }
    },
    parseArgs: {
      args: "first second [third[]]",
      opts: {
        alias: {
          second: "s",
          third: ["t", "a"]
        }
      },
      action: ({ context, input }) => console.log(input),
      choices: ({ context, input }) => {
        if (!input.args.first) {
          return ["Hello", "hello"];
        }
        if (!input.args.second) {
          return ["World", "world"];
        }
        if (!input.args.third) {
          return ["Whatever you like"];
        }
      }
    }
  },
  config: {
    command: "demo"
  }
};

const options = {
  app: {
    version: "0.0.1",
    description:
      "Makitso - A Framework for building composable interactive commandline apps"
  },
  prompt: {
    message: "Makitso>"
  }
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
  .then(() => console.log("Goodbye!"))
  .catch(console.error);
