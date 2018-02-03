#! /usr/bin/env node
"use strict";

// const Makitso = require("makitso");
const Makitso = require("../../");

/*
  Makitso uses Keytar (https://www.npmjs.com/package/keytar) to store secrets.
  A native Node module to get, add, replace, and delete passwords in system's keychain.
  On macOS the passwords are managed by the Keychain, on Linux they are managed by the
  Secret Service API/libsecret, and on Windows they are managed by Credential Vault.
*/

/*
 * define a context schema with a value, `keep.secret` which is stored in
 * the MacOS key chain, file store and will be available to all instances of the app.
 * storeOptions is used to provide the name of the key as `service` and the name of
 * the value stored as `account`.
 */
const schema = {
  keep: {
    secret: {
      store: "secure",
      storeOptions: {
        service: "my-remote-service",
        account: "password"
      },
      ask: {
        prompt: `Enter your service password `,
        secret: true,
        storedValueIs: "response"
      }
    }
  }
};

const commands = {
  login: {
    description: "Needs a secret such as a password",
    action: async ({ context, input }) => {
      const password = await context.get("keep.secret");
      console.log(`shhh.. ${password}`);
    }
  }
};

const myPlugin = { schema, commands };

const makitsoPlugins = Makitso.Plugins();

Makitso({ plugins: [makitsoPlugins, myPlugin] }).catch(console.error);
