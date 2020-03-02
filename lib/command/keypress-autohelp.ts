function AutoHelp({ commandInfo }) {
  return async function keyPress(state, press) {
    if (state.mode === "command") {
      const { info } = state.commandLine();
      let header = [];
      if (info.description) {
        header.push(info.description);
      }
      if (info.help) {
        header.push(info.help);
      }
      state.header = header.join("\n");
    }
    return state;
  };
}

exports = module.exports = AutoHelp;
