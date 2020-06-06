import { findCommand } from "./find";

describe("find", () => {
  const commands = {
    top: {
      commands: { sub: { args: "foo qux", action: async () => undefined } },
    },
  };

  it("finds nothing from nothing", async () => {
    const result = await findCommand({ cmdLine: " ", commands });
    expect(result).toBeUndefined();
  });

  it("finds nothing from partial", async () => {
    const result = await findCommand({ cmdLine: "to", commands });
    expect(result).toBeUndefined();
  });

  it("finds a command group", async () => {
    const cmd = await findCommand({
      cmdLine: "top",
      commands,
    });
    expect(cmd).toBeDefined;
    if (cmd) {
      const { appCmd, cmdPath } = cmd;
      expect(cmdPath).toEqual(["top"]);
      expect(appCmd).toEqual(commands.top);
    }
  });

  it("finds a command - single arg", async () => {
    const cmd = await findCommand({
      cmdLine: "top sub do",
      commands,
    });
    expect(cmd).toBeDefined;
    if (cmd) {
      const { appCmd, cmdPath } = cmd;
      expect(cmdPath).toEqual(["top", "sub"]);
      expect(appCmd).toEqual(commands.top.commands.sub);
    }
  });

  it("finds a command - no args", async () => {
    const cmd = await findCommand({
      cmdLine: "top sub",
      commands,
    });
    expect(cmd).toBeDefined;
    if (cmd) {
      const { appCmd, cmdPath } = cmd;
      expect(cmdPath).toEqual(["top", "sub"]);
      expect(appCmd).toEqual(commands.top.commands.sub);
    }
  });
});
