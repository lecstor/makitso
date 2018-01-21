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

const basicMockAction = jest.fn();

const testCommands = {
  basic: {
    arguments: [
      "one {string} first one",
      "two {string} second one",
      "three {string} third one"
    ],
    options: ["-o --one another one", "-f --four fourth one"],
    action: basicMockAction
  },
  multi: {
    arguments: ["one {string} first one", "multi[]] {string} multi"],
    options: ["--noalias no short alias", "-n no long alias"],
    action: basicMockAction
  },
  optional: {
    arguments: ["one {string} first one", "[optional] {string} optional"],
    action: basicMockAction
  },
  multiOptional: {
    arguments: [
      "one {string} first one",
      "[multiOpt[]] {string} multi-optional"
    ],
    action: basicMockAction
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

const comQuit = Promise.resolve("quit");

async function initMakitso() {
  const makitso = Makitso({ options });
  await makitso.registerPlugins({ commands: testCommands });
  makitso.prompt.start = jest.fn();
  return makitso;
}

function nextCommand(makitso, command) {
  makitso.prompt.start
    .mockReturnValueOnce(Promise.resolve(command))
    .mockReturnValue(comQuit);
}

describe("Makitso", () => {
  it("creates the Makitso instance", async () => {
    const makitso = Makitso({ options });
    expect(makitso.registerPlugins).toBeDefined();
  });

  it("invokes a command with args", async () => {
    const makitso = await initMakitso();
    nextCommand(makitso, "basic Uno due tre quattro");
    await makitso.start();

    const arg0 = lastCalled(basicMockAction);
    expect(arg0.context.getSchema).toBeInstanceOf(Function);
    expect(arg0.input).toEqual({
      args: { one: "Uno", three: "tre", two: "due" },
      unknownArgs: ["quattro"],
      missing: []
    });
  });

  it("invokes a command with a multi arg", async () => {
    const makitso = await initMakitso();
    nextCommand(makitso, "multi Uno due tre quattro");
    await makitso.start();

    const arg0 = lastCalled(basicMockAction);
    expect(arg0.context.getSchema).toBeInstanceOf(Function);
    expect(arg0.input).toEqual({
      args: { multi: ["due", "tre", "quattro"], one: "Uno" },
      missing: []
    });
  });

  it("invokes a command with an optional arg included", async () => {
    const makitso = await initMakitso();
    nextCommand(makitso, "optional Uno due");
    await makitso.start();

    const arg0 = lastCalled(basicMockAction);
    expect(arg0.context.getSchema).toBeInstanceOf(Function);
    expect(arg0.input).toEqual({
      args: { one: "Uno", optional: "due" },
      missing: []
    });
  });

  it("invokes a command with an optional arg not included", async () => {
    const makitso = await initMakitso();
    nextCommand(makitso, "optional Uno");
    await makitso.start();

    const arg0 = lastCalled(basicMockAction);
    expect(arg0.context.getSchema).toBeInstanceOf(Function);
    expect(arg0.input).toEqual({
      args: { one: "Uno" },
      missing: []
    });
  });

  it("invokes a command with an optional multi arg included", async () => {
    const makitso = await initMakitso();
    nextCommand(makitso, "multiOptional Uno due tre");
    await makitso.start();

    const arg0 = lastCalled(basicMockAction);
    expect(arg0.context.getSchema).toBeInstanceOf(Function);
    expect(arg0.input).toEqual({
      args: { multiOpt: ["due", "tre"], one: "Uno" },
      missing: []
    });
  });

  it("invokes a command with an optional multi arg not included", async () => {
    const makitso = await initMakitso();
    nextCommand(makitso, "multiOptional Uno");
    await makitso.start();

    const arg0 = lastCalled(basicMockAction);
    expect(arg0.context.getSchema).toBeInstanceOf(Function);
    expect(arg0.input).toEqual({
      args: { one: "Uno" },
      missing: []
    });
  });

  it("invokes a command with options", async () => {
    const makitso = await initMakitso();
    nextCommand(makitso, "basic -f quattro --three tre");
    await makitso.start();
    const arg0 = lastCalled(basicMockAction);
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
      "basic Uno due tre -o UnoDue --one UnoDueDue -f quattro"
    );
    await makitso.start();
    const arg0 = lastCalled(basicMockAction);
    expect(arg0.context.getSchema).toBeInstanceOf(Function);
    expect(arg0.input).toEqual({
      args: {
        four: ["quattro"],
        one: "Uno",
        three: "tre",
        two: "due"
      },
      unknownOpts: [{ o: ["UnoDue"] }, { one: ["UnoDueDue"] }],
      missing: []
    });
  });
});
