jest.mock("terminal-kit");

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
    arguments: [
      "one {string} first one",
      "two {string} second one",
      "three {string} third one"
    ],
    options: ["-o --one another one", "-f --four fourth one"],
    action: test1MockAction
  },
  quit: {
    action: async () => {
      throw new Error("quit");
    }
  }
};

function lastCalled(mock) {
  return mock.mock.calls[mock.mock.calls.length - 1][0];
}

const comQuit = Promise.resolve({ command: "quit" });

async function initMakitso() {
  const makitso = Makitso({ options });
  await makitso.registerPlugins({ commands: testCommands });
  makitso.enquirer.ask = jest.fn();
  return makitso;
}

function nextCommand(makitso, command) {
  makitso.enquirer.ask
    .mockReturnValueOnce(Promise.resolve({ command }))
    .mockReturnValue(comQuit);
}

describe("Makitso", () => {
  it("creates the Makitso instance", async () => {
    const makitso = Makitso({ options });
    expect(makitso.registerPlugins).toBeDefined();
  });

  it("invokes a command with args", async () => {
    const makitso = await initMakitso();
    nextCommand(makitso, "test1 Uno due tre quattro");
    await makitso.start();

    const arg0 = lastCalled(test1MockAction);
    expect(arg0.context.getSchema).toBeInstanceOf(Function);
    expect(arg0.input).toEqual({
      args: { one: "Uno", three: "tre", two: "due" },
      unknownArgs: ["quattro"]
    });
  });

  it("invokes a command with options", async () => {
    const makitso = await initMakitso();
    nextCommand(makitso, "test1 -f quattro --three tre");
    await makitso.start();
    const arg0 = lastCalled(test1MockAction);
    expect(arg0.context.getSchema).toBeInstanceOf(Function);
    expect(arg0.input).toEqual({
      args: { four: ["quattro"] },
      missing: [
        {
          description: "first one",
          isMulti: undefined,
          isOptional: undefined,
          name: "one",
          string: "one {string} first one",
          type: "string"
        },
        {
          description: "second one",
          isMulti: undefined,
          isOptional: undefined,
          name: "two",
          string: "two {string} second one",
          type: "string"
        },
        {
          description: "third one",
          isMulti: undefined,
          isOptional: undefined,
          name: "three",
          string: "three {string} third one",
          type: "string"
        }
      ],
      unknownOpts: [{ three: ["tre"] }]
    });
  });

  it("removes options that shadow positional args", async () => {
    const makitso = await initMakitso();
    nextCommand(
      makitso,
      "test1 Uno due tre -o UnoDue --one UnoDueDue -f quattro"
    );
    await makitso.start();
    const arg0 = lastCalled(test1MockAction);
    expect(arg0.context.getSchema).toBeInstanceOf(Function);
    expect(arg0.input).toEqual({
      args: {
        four: ["quattro"],
        one: "Uno",
        three: "tre",
        two: "due"
      },
      unknownOpts: [{ o: ["UnoDue"] }, { one: ["UnoDueDue"] }]
    });
  });
});
