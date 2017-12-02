#! /usr/bin/env node

"use strict";

const path = require("path");
const os = require("os");

const _includes = require("lodash/includes");

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
      description: "Test some args and options parsing",
      arguments: [
        "fname {string} Your First Name",
        "sname {string} Your Last Name",
        "age {number} Your real age",
        "rank {string} Your Rank",
        "[likes[]] {string} Things you like"
      ],
      options: ["-d --doe a dear", "-f --far a long way"],
      action: async ({ context, input }) => {
        console.log(input);
      },
      choices: async ({ context, input }) => {
        if (!input.args.fname) {
          return "*";
        }
        if (!input.args.sname) {
          return "*";
        }
        if (!input.args.age) {
          return "*";
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
  },
  config: {
    command: "demo",
    description: "Some demos to try"
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
  .then(() => {
    console.log("Goodbye!");
  })
  .catch(console.error);
