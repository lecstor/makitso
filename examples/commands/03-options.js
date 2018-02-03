#! /usr/bin/env node
"use strict";

// const Makitso = require("makitso");
const Makitso = require("../../");

const commands = {
  sayHi: {
    description: "Says Hi",
    arguments: ["name - the person to say hi to"],
    options: [
      // define an option as single character and/or multi character switches and a description
      // if an option should not take a value, include the {boolean} type marker
      "-h --hello {boolean} - say Hello",
      "-g --greeting - custom Greeting"
    ],

    action: async ({ context, input }) => {
      const { name, hello, greeting } = input.args;
      let message = "Hi";
      if (hello) {
        message = "Hello";
      } else if (greeting) {
        message = greeting;
      }
      console.log(`${message} ${name}`);
    }
  }
};

Makitso({ plugins: [{ commands }] }).catch(console.error);
