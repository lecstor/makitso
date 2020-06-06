import _merge from "lodash/merge";
import _flatten from "lodash/flatten";
import _isString from "lodash/isString";

import { Prompt } from "makitso-prompt";

import { start } from "./command";
import { Context } from "./context";
import {
  YargsParserOptions,
  Argument,
  Command,
  Commands,
  Def,
  Option,
  Plugin,
  PluginSet,
} from "./types";

import { debug } from "./debug";

/**
 *
 * @param {String} arg - name and description
 * @returns {Object} arg
 */
function parseArgument(arg: string): Argument {
  const args = arg.split(/\s+/);
  let [name] = args;
  const [, ...description] = args;
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
    isMulti: Boolean(isMulti),
    isOptional: Boolean(isOptional),
    string: arg,
  };
}

/**
 *
 * @param {String} opt - flags and description
 * @returns {Object} opt
 */
function parseOption(opt: string) {
  const optBits = opt.split(/\s+/);
  debug({ optBits });
  const initial: Option = {
    name: "",
    alias: "",
    description: "",
    parseOpt: { boolean: false },
  };
  const option = optBits.reduce((result, val) => {
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
      result.description = `${result.description} ${val}`;
    }
    return result;
  }, initial);
  return option;
}

function optionsToArgsParserOpts(options: Option[]) {
  return options.reduce((result = {}, opt) => {
    result[opt.name] = opt.alias;
    return result;
  }, {} as YargsParserOptions["alias"]);
}

function parseCommandDef(command: Command) {
  const def: Partial<Def> = command;
  def.argsLookup = {};
  if (def.arguments) {
    def.args = def.arguments.map(parseArgument);
    def.argsLookup = def.args.reduce((lu, arg, idx) => {
      lu ? (lu[arg.name] = idx) : (lu = { [arg.name]: idx });
      return lu;
    }, {} as Def["argsLookup"]);
  }
  if (def.options) {
    def.opts = def.options.reduce((opts, opt) => {
      // parse option and discard if name matches a positional arg
      const pOpt = parseOption(opt);
      if (def.argsLookup?.[pOpt.name] !== undefined) {
        return opts;
      }
      opts ? opts.push(pOpt) : (opts = [pOpt]);
      return opts;
    }, [] as Def["opts"]);
    def.optsLookup = def.opts?.reduce((lu, opt) => {
      if (opt.name) {
        if (!lu) lu = {};
        lu[opt.name] = true;
      }
      if (opt.alias) {
        if (!lu) lu = {};
        lu[opt.alias] = true;
      }
      return lu;
    }, {} as Def["optsLookup"]);
    def.aliasLookup = def.opts?.reduce((lu, opt) => {
      if (opt.alias) {
        if (!lu) lu = {};
        lu[opt.alias] = opt.name;
      }
      return lu;
    }, {} as Def["aliasLookup"]);
    def.opts?.forEach((opt) => {
      if (opt.parseOpt.boolean) {
        if (!def.argsParserOpts?.boolean) {
          def.argsParserOpts = { boolean: [opt.name] };
        } else {
          def.argsParserOpts.boolean.push(opt.name);
        }
      }
    });
    if (!def.argsParserOpts) {
      def.argsParserOpts = {};
    }
    if (def.opts) def.argsParserOpts.alias = optionsToArgsParserOpts(def.opts);
  }
  debug({ def });
  return def;
}

function parseCommandDefs(commands: Commands) {
  for (const key in commands) {
    // _forEach(commands, (def, key) => {
    const command = commands[key];
    if (command.commands) {
      parseCommandDefs(command.commands);
    } else {
      commands[key] = parseCommandDef(command);
    }
  }
}

function mergeCommands(pluginSet: PluginSet, plugin: Plugin) {
  const commands = plugin.commands;
  if (commands) {
    parseCommandDefs(commands);
    _merge(pluginSet.commands, plugin.commands);
  }
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
function addPlugin(pluginSet: PluginSet, plugin: Plugin) {
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
function createPluginSet(plugins: Plugin | Plugin[]) {
  if (!Array.isArray(plugins)) {
    plugins = [plugins];
  }
  return Promise.all(_flatten(plugins)).then((pluginList) => {
    let pluginSet = { schema: {}, stores: {}, commands: {} };
    pluginList.forEach((plugin) => {
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
type MakitsoArgs = {
  plugins: Plugin | Plugin[];
  commandPrompt?: string | Prompt;
  options?: {
    app: {
      description: string;
    };
    prompt: {
      message: string;
    };
  };
  cmdLine?: string;
};

export function Makitso(args: MakitsoArgs) {
  const { commandPrompt, plugins, cmdLine } = args;

  let prompt: Prompt;

  if (commandPrompt) {
    if (_isString(commandPrompt)) {
      prompt = new Prompt({ prompt: commandPrompt });
    } else {
      prompt = commandPrompt;
    }
  } else {
    prompt = new Prompt();
  }

  return createPluginSet(plugins).then((pluginSet) => {
    const { schema, stores, commands } = pluginSet;
    const context = Context({ schema, stores, commands });
    return start({ context, commands, prompt, cmdLine });
  });
}
