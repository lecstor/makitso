#! /usr/bin/env node
"use strict";

// const Makitso = require("makitso");
const Makitso = require("../../");

/*
 * define a context schema with two values, `hello.default` and `hello.response`
 * which are stored in the in-memory session store and will only be available
 * to the current instance of the app.
 */
const schema = {
  hello: {
    default: {
      store: "session",
      ask: {
        prompt: `Who will we say hi to? `,
        // Always prompts, using stored value as default when available
        storedValueIs: "default"
      }
    },
    response: {
      store: "session",
      ask: {
        prompt: `Who will we say hi to? `,
        // Doesn't prompt if it has a stored value
        storedValueIs: "response"
      }
    }
  }
};

const commands = {
  hiDefault: {
    description: "Always prompts, using stored value as default when available",
    action: async ({ context, input }) => {
      const name = await context.get("hello.default");
      console.log(`Hello ${name}`);
    }
  },
  hiResponse: {
    description: "Doesn't prompt if it has a stored value",
    action: async ({ context, input }) => {
      const name = await context.get("hello.response");
      console.log(`Hello ${name}`);
    }
  }
};

const myPlugin = { schema, commands };

Makitso({ plugins: [Makitso.Plugins(), myPlugin] }).catch(console.error);
