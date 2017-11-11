const { Command } = require("commander");
const _forEach = require("lodash/forEach");
const inquirer = require("inquirer");
const coolPrompt = require("inquirer-command-prompt");
const chalk = require("chalk");

inquirer.registerPrompt("command", coolPrompt);
const prompt = inquirer.prompt;

function error(context, err) {
  console.log(chalk.red("Error: "), err.message);
  if (context.debug) {
    console.error(err);
  }
}

async function finishAction(context, commands, cmdOptions) {
  return commandPrompt(context, commands, cmdOptions);
}

function init(context, commands, cmdOptions = {}) {
  const program = new Command();
  const { version = "0.0.0", description = "An interactive commandline app" } =
    cmdOptions.app || {};
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
        .then(() => finishAction(context, commands, cmdOptions))
        .catch(err => error(context, err))
        .then(() => commandPrompt(context, commands, cmdOptions))
    );
  });

  return program;
}

async function commandPrompt(context, commands, cmdOptions = {}) {
  const program = init(context, commands, cmdOptions);
  const { message = "CmdIt", prefix, suffix } = cmdOptions.prompt || {};
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
