"use strict";

const _merge = require("lodash/merge");
const _flatten = require("lodash/flatten");
const _forEach = require("lodash/forEach");
const _map = require("lodash/map");
const _reduce = require("lodash/reduce");

const command = require("./command");
const Context = require("./context");
const Prompt = require("makitso-prompt");

const debug = require("./debug");

/**
 *
 * @param {String} arg - name type description
 * @returns {Object} arg
 */
function parseArgument(arg) {
  let [name, type, ...description] = arg.split(/\s+/);
  let isMulti;
  let isOptional;
  if (/\[]/.test(name)) {
    isMulti = true;
  }
  if (/^\[/.test(name)) {
    isOptional = true;
  }
  name = name.replace(/[[\]]/g, "");
  type = type.replace(/[{}]/g, "");
  return {
    name,
    type,
    description: description.join(" "),
    isMulti,
    isOptional,
    string: arg
  };
}

/**
 *
 * @param {String} opt - name type description
 * @returns {Object} opt
 */
function parseOption(opt) {
  const optBits = opt.split(/\s+/);
  debug({ optBits });
  const options = _reduce(
    optBits,
    (result, val) => {
      if (val.startsWith("--")) {
        result.name = val.replace(/^--/, "");
      } else if (val.startsWith("-")) {
        result.alias = val.replace(/^-/, "");
      } else {
        result.description.push(val);
      }
      return result;
    },
    { description: [] }
  );
  options.description = options.description.join(" ");
  return options;
}

function optionsToArgsParserOpts(options) {
  return _reduce(
    options,
    (result, opt) => {
      result[opt.name] = opt.alias;
      return result;
    },
    {}
  );
}

function mergeCommands(pluginSet, plugin) {
  const commands = plugin.commands;
  _forEach(commands, (def, key) => {
    if (def.arguments) {
      def.args = _map(def.arguments, parseArgument);
      def.argsLookup = _reduce(
        def.args,
        (lu, arg, idx) => {
          lu[arg.name] = idx;
          return lu;
        },
        {}
      );
    }
    if (def.options) {
      def.opts = _reduce(
        def.options,
        (opts, opt) => {
          // parse option and discard if name matches a positional arg
          const pOpt = parseOption(opt);
          if (def.argsLookup[pOpt.name] !== undefined) {
            return opts;
          }
          opts.push(pOpt);
          return opts;
        },
        []
      );
      def.optsLookup = _reduce(
        def.opts,
        (lu, opt, idx) => {
          if (opt.name) {
            lu[opt.name] = idx;
          }
          if (opt.alias) {
            lu[opt.alias] = idx;
          }
          return lu;
        },
        {}
      );
      def.aliasLookup = _reduce(
        def.opts,
        (lu, opt, idx) => {
          if (opt.alias) {
            lu[opt.alias] = opt.name;
          }
          return lu;
        },
        {}
      );
      if (!def.argsParserOpts) {
        def.argsParserOpts = {};
      }
      def.argsParserOpts.alias = optionsToArgsParserOpts(def.opts);
    }
  });
  if (plugin.config && plugin.config.command) {
    // group commands according to plugin config
    _merge(pluginSet.commands, {
      [plugin.config.command]: {
        _description: plugin.config.description,
        ...plugin.commands
      }
    });
  } else {
    _merge(pluginSet.commands, plugin.commands);
  }
  // debug(pluginSet);
  return pluginSet;
}

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
  const { plugin } = args;
  let { pluginSet } = args;

  if (plugin.schema) {
    _merge(pluginSet.schema, plugin.schema);
  }

  if (plugin.stores) {
    _merge(pluginSet.stores, plugin.stores);
  }

  if (plugin.commands) {
    pluginSet = mergeCommands(pluginSet, plugin);
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
        plugins.forEach(plugin => {
          pluginSet = registerPlugin({
            pluginSet,
            plugin
          });
        })
      );
    },
    /**
     * Start the app
     * @returns {void}
     */
    start() {
      const { schema, stores, commands } = pluginSet;
      debug({ commands });
      const context = Context({
        schema,
        stores,
        prompt: Prompt()
      });
      return command({ context, commands, options });
    }
  };
}

module.exports = Makitso;
