#! /usr/bin/env node
"use strict";

// const Makitso = require("makitso");
const { Makitso } = require("../../dist");

const commands = {
  // define a command "sayHi"
  sayHi: {
    description: "Says Hi",
    action: () => {
      console.log("wait for me");
      return new Promise(resolve => {
        setTimeout(() => resolve(), 30000);
      });
    }
  }
};

Makitso({ plugins: { commands } }).catch(console.error);
