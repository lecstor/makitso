#! /usr/bin/env node
"use strict";

// const Makitso = require("makitso");
const { Makitso } = require("../../dist");

const commands = {
  // define a command "sayHi"
  sayHi: {
    description: "Says Hi",
    action: async () => {
      console.log("Hello World");
    }
  }
};

Makitso({ plugins: { commands } }).catch(console.error);
