const { Prompt } = require("makitso-prompt");

const Makitso = require("../makitso");

const options = {
  app: {
    description: "Makitso - tests"
  },
  prompt: {
    message: "Test>"
  }
};

const basicMockAction = jest.fn();

const testCommands = {
  basic: {
    arguments: ["one - first one", "two - second one", "three - third one"],
    options: ["-o --one another one", "-f --four fourth one"],
    action: basicMockAction
  },
  multi: {
    arguments: ["one - first one", "multi... - multi"],
    options: ["--noalias no short alias", "-n no long alias"],
    action: basicMockAction
  },
  optional: {
    arguments: ["one - first one", "[optional] - optional"],
    action: basicMockAction
  },
  multiOptional: {
    arguments: ["one - first one", "[multiOpt...] - multi-optional"],
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

async function initMakitso({ command }) {
  const prompt = new Prompt();
  prompt.start = jest
    .fn()
    .mockReturnValueOnce(Promise.resolve(command))
    .mockReturnValue(comQuit);
  return Makitso({
    options,
    plugins: { commands: testCommands },
    commandPrompt: prompt
  });
}

describe("Makitso", () => {
  it("invokes a command with args", async () => {
    await initMakitso({ command: "basic Uno due tre quattro" });

    const arg0 = lastCalled(basicMockAction);
    expect(arg0.context.getSchema).toBeInstanceOf(Function);
    expect(arg0.input).toEqual({
      args: { one: "Uno", three: "tre", two: "due" },
      unknownArgs: ["quattro"],
      missing: []
    });
  });

  it("invokes a command with a multi arg", async () => {
    await initMakitso({ command: "multi Uno due tre quattro" });

    const arg0 = lastCalled(basicMockAction);
    expect(arg0.context.getSchema).toBeInstanceOf(Function);
    expect(arg0.input).toEqual({
      args: { multi: ["due", "tre", "quattro"], one: "Uno" },
      missing: [],
      current: "multi"
    });
  });

  it("invokes a command with an optional arg included", async () => {
    await initMakitso({ command: "optional Uno due" });

    const arg0 = lastCalled(basicMockAction);
    expect(arg0.context.getSchema).toBeInstanceOf(Function);
    expect(arg0.input).toEqual({
      args: { one: "Uno", optional: "due" },
      missing: [],
      current: "optional"
    });
  });

  it("invokes a command with an optional arg not included", async () => {
    await initMakitso({ command: "optional Uno" });

    const arg0 = lastCalled(basicMockAction);
    expect(arg0.context.getSchema).toBeInstanceOf(Function);
    expect(arg0.input).toEqual({
      args: { one: "Uno" },
      missing: [],
      current: "one"
    });
  });

  it("invokes a command with an optional multi arg included", async () => {
    await initMakitso({ command: "multiOptional Uno due tre" });

    const arg0 = lastCalled(basicMockAction);
    expect(arg0.context.getSchema).toBeInstanceOf(Function);
    expect(arg0.input).toEqual({
      args: { multiOpt: ["due", "tre"], one: "Uno" },
      missing: [],
      current: "multiOpt"
    });
  });

  it("invokes a command with an optional multi arg not included", async () => {
    await initMakitso({ command: "multiOptional Uno" });

    const arg0 = lastCalled(basicMockAction);
    expect(arg0.context.getSchema).toBeInstanceOf(Function);
    expect(arg0.input).toEqual({
      args: { one: "Uno" },
      missing: [],
      current: "one"
    });
  });

  it("invokes a command with options", async () => {
    await initMakitso({ command: "basic -f quattro --three tre" });
    const arg0 = lastCalled(basicMockAction);
    expect(arg0.context.getSchema).toBeInstanceOf(Function);
    expect(arg0.input).toEqual({
      args: { four: ["quattro"] },
      missing: [
        {
          description: "- first one",
          isMulti: undefined,
          isOptional: undefined,
          name: "one",
          string: "one - first one"
        },
        {
          description: "- second one",
          isMulti: undefined,
          isOptional: undefined,
          name: "two",
          string: "two - second one"
        },
        {
          description: "- third one",
          isMulti: undefined,
          isOptional: undefined,
          name: "three",
          string: "three - third one"
        }
      ],
      unknownOpts: [{ three: ["tre"] }],
      current: "one"
    });
  });

  it("removes options that shadow positional args", async () => {
    await initMakitso({
      command: "basic Uno due tre -o UnoDue --one UnoDueDue -f quattro"
    });

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
      missing: [],
      current: "three"
    });
  });
});
