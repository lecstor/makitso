const _filter = require("lodash/filter");

const parse = require("./args");
const findCommand = require("./find");

const debug = require("../debug");

function getChoices(obj) {
  return _filter(Object.keys(obj), choice => !choice.startsWith("_"));
}

function Parser({ context, commands }) {
  return async function keyPress(state, press) {
    let cmdLine = state.command();
    const cmd = await findCommand({ cmdLine, commands });

    let info = {};

    if (cmd) {
      const { appCmd, cmdArgs } = cmd;
      info.description = appCmd._description || appCmd.description;
      info.options = appCmd.options;
      info.args = appCmd.args;
      info.choices = getChoices(appCmd.commands || appCmd);
      if (!appCmd.commands) {
        info.input = parse({ appCmd, cmdArgs });
        info.hasAction = true;
        if (!appCmd.choices) {
          info.choices = [];
        } else {
          debug({ choicesFn: typeof appCmd.choices });
          if (typeof appCmd.choices === "function") {
            debug(["appCmd.choices", appCmd.choices.toString()]);
            info.choices = await appCmd.choices({
              context,
              input: info.input
            });
            debug(["command.choices", info.choices]);
          } else {
            info.choices = appCmd.choices;
          }
        }
      }
    } else {
      info.choices = getChoices(commands);
    }

    const filter = cmd ? cmd.cmdArgsList.pop() : cmdLine;
    if (filter) {
      const matches = _filter(info.choices, choice =>
        choice.startsWith(filter)
      );
      if (matches.length) {
        info.choices = matches;
      }
    }
    state.commandLine({ info });
  };
}

exports = module.exports = Parser;
