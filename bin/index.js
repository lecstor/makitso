#! /usr/bin/env node

"use strict";

const path = require("path");
const os = require("os");

const CommandIt = require("../");
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
      action: async context => {
        const firstName = await context.get("my.name.first");
        const lastName = await context.get("my.name.last");
        console.log(`${firstName} ${lastName}`);
      }
    }
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

const DefaultStores = CommandIt.DefaultStores;
const appName = path.basename(process.argv[1]);
const cmdIt = CommandIt({ options });

cmdIt
  .registerPlugins(
    DefaultStores({
      file: { path: path.join(os.homedir(), `/.${appName}.json`), data: {} },
      session: { data: {} }
    }),
    localPlugin,
    tunnelPlugin,
    developPlugin
  )
  .then(() => cmdIt.start());
