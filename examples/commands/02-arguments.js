#! /usr/bin/env node
"use strict";

// const Makitso = require("makitso");
const Makitso = require("../../");

const commands = {
  // define a command "sayHi" with arguments
  sayHi: {
    description: "Says Hi",
    arguments: [
      // define a positional argument with label and description
      "name - the person to say hi to",
      // the last argument can be [optional], or take multiple... values, or both
      "[likes...] - things they like"
    ],
    action: async ({ context, input }) => {
      // input.args object contains the argument values
      const { name, likes } = input.args;
      console.log(`Hello ${name}`);
      if (likes) {
        console.log(`I hear you like ${likes.join(", ")}`);
      }
    }
  }
};

Makitso({ plugins: [{ commands }] }).catch(console.error);
