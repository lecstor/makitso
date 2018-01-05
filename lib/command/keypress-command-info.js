const _filter = require("lodash/filter");

const { applyPatch } = require("makitso-prompt/immutably");

const parse = require("./args");
const findCommand = require("./find");

const debug = require("../debug");

function getChoices(obj) {
  return _filter(Object.keys(obj), choice => !choice.startsWith("_"));
}

function Parser({ context, commands }) {
  return async function keyPress(state, press) {
    let cmdLine = state.prompt.command.text;
    const cmd = await findCommand({ cmdLine, commands });

    let command = {};

    if (cmd) {
      const { appCmd, cmdArgs } = cmd;
      command.description = appCmd._description || appCmd.description;
      command.options = appCmd.options;
      command.args = appCmd.args;
      command.choices = getChoices(appCmd);
      if (appCmd.action) {
        command.input = parse({ appCmd, cmdArgs });
        command.hasAction = true;
        if (!appCmd.choices) {
          command.choices = [];
        } else {
          debug({ choicesFn: typeof appCmd.choices });
          if (typeof appCmd.choices === "function") {
            debug(["appCmd.choices", appCmd.choices.toString()]);
            command.choices = await appCmd.choices({
              context,
              input: command.input
            });
            debug(["command.choices", command.choices]);
          } else {
            command.choices = appCmd.choices;
          }
        }
      }
    } else {
      command.choices = getChoices(commands);
    }

    const filter = cmd ? cmd.cmdArgsList.pop() : cmdLine;
    if (filter) {
      const matches = _filter(command.choices, choice =>
        choice.startsWith(filter)
      );
      if (matches.length) {
        command.choices = matches;
      }
    }

    return applyPatch(state, { prompt: { command } });
  };
}

exports = module.exports = Parser;
