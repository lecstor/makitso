jest.mock("inquirer");
jest.mock("terminal-kit");

const inquirer = require("inquirer");

const Makitso = require("../");

const options = {
  app: {
    version: "0.0.1",
    description: "Makitso - tests"
  },
  prompt: {
    message: "Test>"
  }
};

const test1MockAction = jest.fn();

const testCommands = {
  test1: {
    args: "one two three",
    opts: { alias: { two: "t" } },
    action: test1MockAction
  },
  quit: {
    args: "",
    opts: { alias: {} },
    action: () => {
      throw new Error("quit");
    }
  }
};

function lastCalled(mock) {
  return mock.mock.calls[mock.mock.calls.length - 1][0];
}

const comQuit = Promise.resolve({ cmdLine: "quit" });

async function initMakitso() {
  const makitso = Makitso({ options });
  await makitso.registerPlugins({ commands: testCommands });
  return makitso.start();
}

describe("Makitso", () => {
  it("creates the Makitso instance", async () => {
    const makitso = Makitso({ options });
    expect(makitso.registerPlugins).toBeDefined();
  });

  it("invokes a command with args", async () => {
    inquirer.prompt
      .mockReturnValueOnce(
        Promise.resolve({ cmdLine: "test1 Uno due tre quattro" })
      )
      .mockReturnValueOnce(comQuit);
    await initMakitso();

    const arg0 = lastCalled(test1MockAction);
    expect(arg0.context.getSchema).toBeInstanceOf(Function);
    expect(arg0.input).toEqual({
      args: { one: "Uno", three: "tre", two: "due" },
      unknown: ["quattro"]
    });
  });

  it("invokes a command with options", async () => {
    inquirer.prompt
      .mockReturnValueOnce(
        Promise.resolve({ cmdLine: "test1 -t due --three tre" })
      )
      .mockReturnValueOnce(comQuit);
    await initMakitso();
    const arg0 = lastCalled(test1MockAction);
    expect(arg0.context.getSchema).toBeInstanceOf(Function);
    expect(arg0.input).toEqual({
      args: { t: ["due"] },
      missing: ["one", "two", "three"],
      unknown: [{ three: "tre" }]
    });
  });
});
