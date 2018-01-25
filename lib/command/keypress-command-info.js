const _filter = require("lodash/filter");

const parse = require("./args");
const findCommand = require("./find");

const debug = require("../debug");

function getSuggests(obj) {
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
      info.suggests = getSuggests(appCmd.commands || appCmd);
      if (!appCmd.commands) {
        info.input = parse({ appCmd, cmdArgs, cmdLine });
        info.hasAction = true;
        if (!appCmd.suggest) {
          info.suggests = [];
        } else {
          debug({ suggestsFn: typeof appCmd.suggest });
          if (typeof appCmd.suggest === "function") {
            debug(["appCmd.suggest", appCmd.suggest.toString()]);
            info.suggests = await appCmd.suggest({
              context,
              input: info.input
            });
            debug(["command.suggests", info.suggests]);
          } else {
            info.suggests = appCmd.suggest;
          }
        }
      }
    } else {
      info.suggests = getSuggests(commands);
    }

    debug({ cmd, cmdLine: `"${cmdLine}"` });
    let filter;
    if (!/\s$/.test(cmdLine)) {
      filter = cmd ? cmd.cmdArgsList.pop() : cmdLine;
    }
    if (filter) {
      const matches = _filter(info.suggests, choice =>
        choice.startsWith(filter)
      );
      if (matches.length) {
        info.suggests = matches;
      }
    }
    state.commandLine({ info });
  };
}

exports = module.exports = Parser;
