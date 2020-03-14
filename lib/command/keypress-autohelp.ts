import { State } from "makitso-prompt";

export function AutoHelp() {
  return async function keyPress(state: State) {
    const commandLine = state.commandLine();
    if (state.mode === "command" && commandLine) {
      const { info } = state.stash;
      const header = [];
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
