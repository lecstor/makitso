"use strict";

const _merge = require("lodash/merge");

const cmd = require("./lib/program");
const Context = require("./lib/context");

/**
 * Register a plugin
 *
 * @param {Object} args - args
 * @param {Object} args.schema - registered schema
 * @param {Object} args.stores - registered stores
 * @param {Object} args.commands - registered commands
 * @param {Object} args.plugin - plugin to register
 * @param {Object} args.plugin.schema - schema to register
 * @param {Object} args.plugin.stores - stores to register
 * @param {Object} args.plugin.commands - commands to register
 * @returns {Object} context - the new context
 */
function registerPlugin(args) {
  const { schema, stores, commands, plugin } = args;
  _merge(schema, plugin.schema);
  _merge(stores, plugin.stores);
  _merge(commands, plugin.commands);
  return { schema, stores, commands };
}

/**
 *
 * @param {Object} args - args
 * @param {Object} args.options - the plugin's context schema
 * @returns {Object} context
 */
function CommandIt(args) {
  const { options } = args;
  let schema = {};
  let stores = {};
  let commands = {};

  return {
    /**
     * Register Plugins
     *
     * @param {Object|Array} plugins - plugins to register
     * @returns {void}
     */
    registerPlugins(plugins) {
      if (!Array.isArray(plugins)) {
        ({ schema, stores, commands } = registerPlugin({
          schema,
          stores,
          commands,
          plugin: plugins
        }));
      } else {
        plugins.forEach(
          plugin =>
            ({ schema, stores, commands } = registerPlugin({
              schema,
              stores,
              commands,
              plugin
            }))
        );
      }
    },
    /**
     * Start the app
     * @returns {void}
     */
    start() {
      const context = Context({ schema, stores });
      cmd(context, commands, options);
    }
  };
}

module.exports = CommandIt;
