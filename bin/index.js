#! /usr/bin/env node

"use strict";

const CommandIt = require("../");

const Session = require("../lib/context/store/memory-store");

function setValue(context, prop, value) {
  context.debug && console.log(context, prop, value);
  return context.set(prop, value);
}

function getValue(context, prop) {
  return context.get(prop).then(console.log);
}

const stores = { session: Session() };

const schema = {
  twitter: {
    username: {
      store: "session",
      prompt: {
        type: "input",
        name: "username",
        message: `Enter your Twitter username ...`
      }
    }
  },
  tunnnelblick: {
    password: {
      store: "keychain",
      storeOptions: {
        service: "commandit-tunnelblick-{variant}",
        account: "password"
      },
      prompt: {
        type: "password",
        name: "password",
        message: `Enter your VPN password ...`
      }
      // secure: true
      // promptWithDefault: true
      // default: "lecstor"
    }
  }
};

const commands = {
  set: {
    command: "set <prop> <value>",
    description: "Set a context value",
    action: setValue
  },
  get: {
    command: "get <prop>",
    description: "Get a context value",
    action: getValue
  },
  dump: {
    description: "Dump the store",
    action: async context => {
      console.log(JSON.stringify(await stores.session.read(), null, 2));
    }
  },
  debugOn: {
    description: "Turn on debugging",
    action: async context => {
      context.debug = true;
      console.log("Debug On");
    }
  },
  debugOff: {
    description: "Turn off debugging",
    action: async context => {
      context.debug = false;
      console.log("Debug Off");
    }
  }
};

const options = {
  app: {
    version: "0.0.1",
    description: "CommandIt - Interactive Commandline App Creator"
  },
  prompt: {
    message: "CmdIt"
  }
};

const cmdIt = CommandIt({ options });
cmdIt.registerPlugins({ schema, stores, commands });
cmdIt.start();
