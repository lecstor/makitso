const autoCompleteFn = require("../autocomplete");

const mockChoices1 = jest.fn(() => ["foo", "bar", "baz"]);

const appCommands = {
  coms1: {
    comm1: {
      action: () => {}
    },
    comm2: {
      action: () => {},
      choices: ["foo", "bar", "baz"]
    },
    comm3: {
      action: () => {},
      choices: mockChoices1
    }
  },
  coms2: {}
};

const context = "MOCK-CONTEXT-OBJECT";

describe("autocomplete", () => {
  const acFn = autoCompleteFn({ context, appCommands });

  it("returns a list of the top-level commands for no command", async () => {
    const result = await acFn("");
    expect(result).toEqual(["coms1", "coms2"]);
  });

  it("returns a list of the top-level commands for bad command", async () => {
    const result = await acFn("abc");
    expect(result).toEqual(["coms1", "coms2"]);
  });

  it("returns a list of sub commands for a command group", async () => {
    const result = await acFn("coms1");
    expect(result).toEqual(["comm1", "comm2", "comm3"]);
  });

  it("returns choices array", async () => {
    const result = await acFn("coms1 comm2");
    expect(result).toEqual(["foo", "bar", "baz"]);
  });

  it("returns an empty list for command without choices", async () => {
    const result = await acFn("coms1 comm1");
    expect(result).toEqual([]);
  });

  it("calls choices function with context and args", async () => {
    const result = await acFn("coms1 comm3 arg1");
    const args = { argv: {}, unknown: ["arg1"] };
    expect(mockChoices1).lastCalledWith({ context, args });
    expect(result).toEqual(["foo", "bar", "baz"]);
  });
});
