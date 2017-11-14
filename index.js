"use strict";

const _merge = require("lodash/merge");

const cmd = require("./lib/program");
const Context = require("./lib/context");
const DefaultStores = require("./lib/plugins/default-stores");

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
    _merge(pluginSet.commands, plugin.commands);
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
 * @param {String} [args.options.prompt.message="CommandIt>"] - text to display as the prompt
 * @param {Object} args.options.fileStore - file store options
 * @param {String} [args.options.fileStore.file="~/.commandit/file-store.json"] - location of the file store
 * @returns {Object} context
 */
function CommandIt(args) {
  const { options } = args;
  let pluginSet = { schema: {}, stores: {}, commands: {} };

  return {
    /**
     * Register Plugins
     *
     * @param {Object|Array} plugins - plugins to register
     * @returns {void}
     */
    registerPlugins(plugins) {
      if (!Array.isArray(plugins)) {
        pluginSet = registerPlugin({ pluginSet, plugin: plugins });
      } else {
        plugins.forEach(plugin => {
          pluginSet = registerPlugin({ pluginSet, plugin });
        });
      }
    },
    /**
     * Start the app
     * @returns {void}
     */
    start() {
      const { schema, stores, commands } = pluginSet;
      const context = Context({ schema, stores });
      cmd(context, commands, options);
    }
  };
}

module.exports = CommandIt;
CommandIt.DefaultStores = DefaultStores;
