"use strict";

const _merge = require("lodash/merge");
const _flatten = require("lodash/flatten");

const cmd = require("./lib/command");
const Context = require("./lib/context");
const DefaultStores = require("./lib/plugins/default-stores");
const FileStore = require("./lib/plugins/store/file-store");
const KeychainStore = require("./lib/plugins/store/keychain-store");
const MemoryStore = require("./lib/plugins/store/memory-store");

/**
 * Register a plugin
 *
 * @param {Object} args - args
 * @param {Object} args.pluginSet - registered plugins
 * @param {Object} args.pluginSet.schema - schema
 * @param {Object} args.pluginSet.stores - stores
 * @param {Object} args.pluginSet.commands - commands
 * @param {Object} args.plugin - plugin to register
 * @param {Object} args.plugin.schema - schema
 * @param {Object} args.plugin.stores - stores
 * @param {Object} args.plugin.commands - commands
 * @returns {Object} the updated pluginSet
 */
function registerPlugin(args) {
  const { pluginSet, plugin } = args;
  if (plugin.schema) {
    _merge(pluginSet.schema, plugin.schema);
  }
  if (plugin.stores) {
    _merge(pluginSet.stores, plugin.stores);
  }
  if (plugin.commands) {
    if (plugin.config && plugin.config.command) {
      // group commands according to plugin config
      _merge(pluginSet.commands, { [plugin.config.command]: plugin.commands });
    } else {
      _merge(pluginSet.commands, plugin.commands);
    }
  }
  return pluginSet;
}

/**
 *
 * @param {Object} args - args
 * @param {Object} args.options -
 * @param {Object} args.options.app - app options
 * @param {String} args.options.app.description - app description
 * @param {String} args.options.app.version - app version
 * @param {Object} args.options.prompt - prompt options
 * @param {String} [args.options.prompt.message="Makitso>"] - text to display as the prompt
 * @param {Object} args.options.fileStore - file store options
 * @param {String} [args.options.fileStore.file="~/.commandit/file-store.json"] - location of the file store
 * @returns {Object} context
 */
function Makitso(args) {
  const { options } = args;
  let pluginSet = { schema: {}, stores: {}, commands: {} };

  return {
    /**
     * Register Plugins
     *
     * @param {Object|Array} plugins - plugins to register
     * @returns {void}
     */
    registerPlugins(...args) {
      return Promise.all(_flatten(args)).then(plugins =>
        plugins.forEach(
          plugin => (pluginSet = registerPlugin({ pluginSet, plugin }))
        )
      );
    },
    /**
     * Start the app
     * @returns {void}
     */
    start() {
      const { schema, stores, commands } = pluginSet;
      const context = Context({ schema, stores });
      cmd({ context, commands, options }).catch(console.error);
    }
  };
}

module.exports = Makitso;
Makitso.DefaultStores = DefaultStores;
Makitso.MemoryStore = MemoryStore;
Makitso.FileStore = FileStore;
Makitso.KeychainStore = KeychainStore;

process.stdin.resume(); // so the program will not close instantly

function exitHandler(options, err) {
  if (options.cleanup) {
    console.log("clean");
  }
  if (err) {
    console.log(err.stack);
  }
  if (options.exit) {
    process.exit();
  }
}

// do something when app is closing
process.on("exit", exitHandler.bind(null, { cleanup: true }));

// catches ctrl+c event
process.on("SIGINT", exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));

// catches uncaught exceptions
process.on("uncaughtException", exitHandler.bind(null, { exit: true }));
