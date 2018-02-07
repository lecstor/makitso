#! /usr/bin/env node
"use strict";

// const Makitso = require("makitso");
const Makitso = require("../../");

function suggest({ property }) {
  return [property, "John", "Sam"];
}

/*
 * define a context properties with suggestions
 */
const schema = {
  hello: {
    static: {
      store: "session",
      ask: {
        prompt: `Who will we say hi to? `,
        storedValueIs: "default",
        suggest: ["John", "Sam", "Alexandria", "me"]
      }
    },
    dynamic: {
      store: "session",
      ask: {
        prompt: `Who will we say hi to? `,
        storedValueIs: "default",
        suggest
      }
    }
  }
};

const commands = {
  staticSuggest: {
    description: "Suggests answers from a list",
    action: async ({ context, input }) => {
      const name = await context.get("hello.static");
      console.log(`Hello ${name}`);
    }
  },
  dynamicSuggest: {
    description: "Suggests answers from a function",
    action: async ({ context, input }) => {
      const name = await context.get("hello.dynamic");
      console.log(`Hello ${name}`);
    }
  }
};

const myPlugin = { schema, commands };

Makitso({ plugins: [Makitso.Plugins(), myPlugin] }).catch(console.error);
