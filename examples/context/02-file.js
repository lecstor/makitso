#! /usr/bin/env node
"use strict";

const path = require("path");
const os = require("os");

// const Makitso = require("makitso");
const Makitso = require("../../");

/*
 * define a context schema with a value, `hello.default` which is stored in the
 * file store and will be available to all instances of the app.
 */
const schema = {
  hello: {
    default: {
      store: "file",
      ask: {
        prompt: `Who will we say hi to? `,
        // Always prompts, using stored value as default when available
        storedValueIs: "default",
      },
    },
  },
};

const commands = {
  hiDefault: {
    description: "Always prompts, using stored value as default when available",
    action: async ({ context, input }) => {
      const name = await context.get("hello.default");
      console.log(`Hello ${name}`);
    },
  },
};

const myPlugin = { schema, commands };

const appName = path.basename(process.argv[1]);
const filePath = path.join(os.homedir(), `/.${appName}.json`);
const makitsoPlugins = Makitso.Plugins({ file: { path: filePath } });

Makitso({ plugins: [makitsoPlugins, myPlugin] }).catch(console.error);
