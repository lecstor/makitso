import * as yargsParseArgs from "yargs-parser";

// import { CommandLine as BaseCmdLine } from "makitso-prompt";

import { Store, Stores } from "./plugins/stores";

export type Stash = {
  info: {};
};

export type Argument = {
  name: string;
  description?: string;
  isMulti?: boolean;
  isOptional?: boolean;
  string?: string;
};

export type Option = {
  name: string;
  alias: string;
  description: string;
  parseOpt: { boolean: boolean };
};

export type Plugin = {
  commands?: Commands;
  schema?: ContextSchema;
  stores?: Store[];
};

export type PluginSet = {
  commands: Commands;
  schema: ContextSchema;
  stores: Stores;
};

export type ContextSchema = {};

export type CommandActionInputArgs = { [key: string]: string | string[] };

export type CommandActionInput = {
  args: CommandActionInputArgs;
};

export type CommandActionArgs = {
  command: Command;
  context: ContextSchema;
  input: CommandActionInput;
};

export type CommandAction = (args: CommandActionArgs) => Promise<void>;

export type Command = {
  description?: string;
  action?: CommandAction;
  arguments?: string[];
  options?: string[];
  suggest?: (args: CommandActionArgs) => Promise<string[]>;
  help?: (args: {
    context: ContextSchema;
    command: Def;
    input: CommandActionInput;
  }) => string;

  commands?: Commands;
};

export type YargsParserOptions = yargsParseArgs.Options;
export type YargsParserArguments = yargsParseArgs.Arguments;

export type Def = Command & {
  aliasLookup?: { [key: string]: string };
  args?: Argument[];
  argsLookup?: { [key: string]: number };
  opts?: Option[];
  optsLookup?: { [key: string]: boolean };
  argsParserOpts?: yargsParseArgs.Options;
};

export type Commands = { [key: string]: Command };
export type Defs = { [key: string]: Def };

export type CommandInfo = {
  description?: string;
  opts?: unknown;
  args?: unknown;
  suggests?: string[];
  help?: unknown;
  hasAction?: boolean;
  helps?: string[];
  input?: CommandActionInput;
};

export type CommandInfoArgs = {
  context: ContextSchema;
  commands: Defs;
};

export type Context = {
  commands: Defs;
};

export type Input = {
  args: {
    command: string[];
  };
};

export type ParsedArgs = {
  unknownArgs?: string[];
  unknownOpts?: { [key: string]: string[] }[];
  args: CommandActionInputArgs;
  // opts: { [key: string]: any };
  missing: Argument[];
  current?: string;
};
