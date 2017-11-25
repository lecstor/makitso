const findCommand = require("../find");

describe("find", () => {
  const appCommands = { top: { sub: { args: "foo qux", action: () => {} } } };

  it("finds nothing from nothing", async () => {
    const result = await findCommand({ cmdLine: " ", appCommands });
    expect(result).toBeUndefined();
  });

  it("finds nothing from partial", async () => {
    const result = await findCommand({ cmdLine: "to", appCommands });
    expect(result).toBeUndefined();
  });

  it("finds a command group", async () => {
    const { appCmd, cmdPath } = await findCommand({
      cmdLine: "top",
      appCommands
    });
    expect(cmdPath).toEqual(["top"]);
    expect(appCmd).toEqual(appCommands.top);
  });

  it("finds a command - no args", async () => {
    const { appCmd, cmdPath } = await findCommand({
      cmdLine: "top sub do",
      appCommands
    });
    expect(cmdPath).toEqual(["top", "sub"]);
    expect(appCmd).toEqual(appCommands.top.sub);
  });

  it("finds a command - no args", async () => {
    const { appCmd, cmdPath } = await findCommand({
      cmdLine: "top sub",
      appCommands
    });
    expect(cmdPath).toEqual(["top", "sub"]);
    expect(appCmd).toEqual(appCommands.top.sub);
  });
});
