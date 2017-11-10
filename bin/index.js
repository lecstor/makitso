#! /usr/bin/env node

const cmd = require("../lib/program");
const Context = require("../lib/context");
const Session = require("../lib/context/store/memory-store");

function setValue(context, prop, value) {
  context.debug && console.log(context, prop, value);
  return context.set(prop, value);
}

function getValue(context, prop) {
  return context.get(prop).then(console.log);
}

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

const session = Session();
const context = Context({ schema, stores: { session } });
// context.promptPrefix = "Hello";
// context.prompt = "World";

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
    action: async () => {
      console.log(JSON.stringify(await session.read(), null, 2));
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
    message: "It",
    prefix: "Cmd"
  }
};
cmd(context, commands, options);
