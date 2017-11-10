const { Command } = require("commander");
const _forEach = require("lodash/forEach");
const inquirer = require("inquirer");
const coolPrompt = require("inquirer-command-prompt");

inquirer.registerPrompt("command", coolPrompt);
const prompt = inquirer.prompt;

function error(context, err) {
  console.log(err.message);
  if (context.debug) {
    console.error(err);
  }
}

async function finishAction(context, commands, options) {
  return commandPrompt(context, commands, options);
}

function init(context, commands, options = {}) {
  const program = new Command();
  const { version = "0.0.0", description = "An interactive commandline app" } =
    options.app || {};
  program.version(version).description(description);

  _forEach(commands, (conf, commandKey) => {
    const { alias, description, action, command = commandKey, options } = conf;
    const comm = program
      .command(command)
      .alias(alias)
      .description(description);
    if (options) {
      options.forEach(option => {
        comm.option(...option);
      });
    }
    comm.action((...args) =>
      action(context, ...args)
        .then(() => finishAction(context, commands, options))
        .catch(err => error(context, err))
    );
  });

  return program;
}

async function commandPrompt(context, commands, options) {
  const program = init(context, commands, options);
  const { message = "CmdIt", prefix, suffix } = options.prompt || {};
  const { command } = await prompt({
    name: "command",
    message,
    prefix,
    suffix,
    autoCompletion: Object.keys(commands)
  });
  await program.parse(["", "", ...command.split(/\s+/)]);
}

exports = module.exports = commandPrompt;
