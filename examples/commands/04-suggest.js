#! /usr/bin/env node
"use strict";

// const Makitso = require("makitso");
const Makitso = require("../../");

const commands = {
  sayHi: {
    description: "Says Hi",
    arguments: [
      "name - the person to say hi to",
      "[likes...] - things they like",
    ],
    action: async ({ context, input }) => {
      const { name, likes } = input.args;
      console.log(`Hello ${name}`);
      if (likes) {
        console.log(`I hear you like ${likes.join(", ")}`);
      }
    },
    suggest: async ({ context, input }) => {
      // if the current arg being entered is "likes", suggest some likes
      if (input.current === "likes") {
        return ["Cheesecake", "TV", "Puzzles"];
      }
      return [];
    },
  },
};

Makitso({ plugins: [{ commands }] }).catch(console.error);
