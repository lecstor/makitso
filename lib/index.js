"use strict";

const _merge = require("lodash/merge");
const _flatten = require("lodash/flatten");
const _forEach = require("lodash/forEach");
const _isString = require("lodash/isString");
const _map = require("lodash/map");
const _reduce = require("lodash/reduce");

const start = require("./command");
const Context = require("./context");
const Prompt = require("makitso-prompt");

const debug = require("./debug");

/**
 *
 * @param {String} arg - name and description
 * @returns {Object} arg
 */
function parseArgument(arg) {
  let [name, ...description] = arg.split(/\s+/);
  let isMulti;
  let isOptional;
  if (/^\[/.test(name)) {
    isOptional = true;
    name = name.replace(/[[\]]/g, "");
  }

  if (/\.\.\.$/.test(name)) {
    isMulti = true;
    name = name.replace(/\.\.\.$/, "");
  }

  return {
    name,
    description: description.join(" "),
    isMulti,
    isOptional,
    string: arg
  };
}

/**
 *
 * @param {String} opt - flags and description
 * @returns {Object} opt
 */
function parseOption(opt) {
  const optBits = opt.split(/\s+/);
  debug({ optBits });
  const options = _reduce(
    optBits,
    (result, val) => {
      if (/^--\w/.test(val)) {
        result.name = val.replace(/^--/, "");
      } else if (/^-\w/.test(val)) {
        result.alias = val.replace(/^-/, "");
      } else if (/^\{\w+}$/.test(val)) {
        const parseOpt = val.replace(/^\{/, "").replace(/}$/, "");
        if (parseOpt === "bool" || parseOpt === "boolean") {
          result.parseOpt.boolean = true;
        }
      } else {
        result.description.push(val);
      }
      return result;
    },
    { description: [], parseOpt: { boolean: false } }
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

function parseCommandDef(def) {
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
          lu[opt.name] = true;
        }
        if (opt.alias) {
          lu[opt.alias] = true;
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
      def.argsParserOpts = { boolean: [] };
    }
    def.opts.forEach(opt => {
      if (opt.parseOpt.boolean) {
        def.argsParserOpts.boolean.push(opt.name);
      }
    });
    def.argsParserOpts.alias = optionsToArgsParserOpts(def.opts);
  }
  debug({ def });
  return def;
}

function parseCommandDefs(commands) {
  _forEach(commands, (def, key) => {
    if (def.commands) {
      parseCommandDefs(def.commands);
    } else {
      commands[key] = parseCommandDef(def);
    }
  });
}

function mergeCommands(pluginSet, plugin) {
  const commands = plugin.commands;
  parseCommandDefs(commands);
  _merge(pluginSet.commands, plugin.commands);
  return pluginSet;
}

/**
 * Add a plugin to a plugin set
 *
 * @param {Object} pluginSet - registered plugins
 * @param {Object} pluginSet.schema - schema
 * @param {Object} pluginSet.stores - stores
 * @param {Object} pluginSet.commands - commands
 * @param {Object} plugin - plugin to register
 * @param {Object} plugin.schema - schema
 * @param {Object} plugin.stores - stores
 * @param {Object} plugin.commands - commands
 * @returns {Object} the updated pluginSet
 */
function addPlugin(pluginSet, plugin) {
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
 * merge one or more plugins into a plugin set
 *
 * @param {Object[]|Object} plugins - a single plugin or list of plugins
 * @returns {Object} pluginSet
 */
function createPluginSet(plugins) {
  if (!Array.isArray(plugins)) {
    plugins = [plugins];
  }
  return Promise.all(_flatten(plugins)).then(pluginList => {
    let pluginSet = { schema: {}, stores: {}, commands: {} };
    pluginList.forEach(plugin => {
      pluginSet = addPlugin(pluginSet, plugin);
    });
    return pluginSet;
  });
}

/**
 * Start the Makitso app
 *
 * @param {Object} args - args
 * @param {Object} options -
 * @param {String|Prompt} [args.commandPrompt="Makitso>"] - prompt text or makitso-prompt instance
 * @returns {Promise} makitso
 */
function Makitso(args = {}) {
  const { plugins, contextPrompt = Prompt() } = args;
  let { commandPrompt } = args;

  if (commandPrompt) {
    if (_isString(commandPrompt)) {
      commandPrompt = Prompt({ prompt: commandPrompt });
    }
  } else {
    commandPrompt = Prompt();
  }

  return createPluginSet(plugins).then(pluginSet => {
    const { schema, stores, commands } = pluginSet;
    const context = Context({
      schema,
      stores,
      commands,
      prompt: contextPrompt
    });
    return start({ context, commands, prompt: commandPrompt });
  });
}

module.exports = Makitso;
