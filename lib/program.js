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

function init(context, commands, cmdOptions = {}) {
  const program = new Command();
  const { version = "0.0.0", description = "An interactive commandline app" } =
    cmdOptions.app || {};
  program.version(version).description(description);

  program
    .command("help")
    .alias("h")
    .description("Display this help")
    .action(() => program.outputHelp());

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
      action(context, ...args).catch(err => error(context, err))
    );
  });

  return program;
}

async function commandPrompt(context, commands, cmdOptions = {}) {
  const program = init(context, commands, cmdOptions);
  const { message = "CmdIt", prefix, suffix } = cmdOptions.prompt || {};
  const { command } = await prompt({
    type: "command", // use coolPrompt with history & autocomplete
    name: "command",
    message,
    prefix,
    suffix,
    autoCompletion: Object.keys(commands)
  });
  await program.parse(["", "", ...command.split(/\s+/)]);
  commandPrompt(context, commands, cmdOptions);
}

exports = module.exports = commandPrompt;
