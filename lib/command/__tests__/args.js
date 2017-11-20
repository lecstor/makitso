const parseArgs = require("yargs-parser");

const applyArgNames = require("../args");
const getArgNames = applyArgNames.getArgNames;

describe("Args", () => {
  describe("getArgNames", () => {
    it("returns the names of positional arguments", () => {
      const args = "one two three -p four --thing five";
      expect(getArgNames(args)).toEqual(["one", "two", "three"]);
    });
  });

  describe("applyArgNames", () => {
    it("names positional arguments", () => {
      const inputArgs = parseArgs("hello world");
      const args = { appCmd: { args: "what who" }, inputArgs };
      expect(applyArgNames(args)).toEqual({
        assignedInputArgs: { who: "world", what: "hello" }
      });
    });

    it("identifies missing positional arguments by name", () => {
      const inputArgs = parseArgs("hello");
      const args = { appCmd: { args: "what who" }, inputArgs };
      expect(applyArgNames(args)).toEqual({
        assignedInputArgs: { what: "hello" },
        missing: ["who"]
      });
    });

    it("identifies extra positional arguments by value", () => {
      const inputArgs = parseArgs("hello Jon age 8");
      const args = { appCmd: { args: "what who" }, inputArgs };
      expect(applyArgNames(args)).toEqual({
        assignedInputArgs: { what: "hello", who: "Jon" },
        unknown: ["age", 8]
      });
    });

    it("includes options", () => {
      const inputArgs = parseArgs("-a -bc --what hello --who world");
      const args = { appCmd: {}, inputArgs };
      expect(applyArgNames(args)).toEqual({
        assignedInputArgs: {
          a: true,
          b: true,
          c: true,
          what: "hello",
          who: "world"
        }
      });
    });

    it("assigns positional arguments", () => {
      const inputArgs = parseArgs("hello 2 -p world --thing 5 -a -bc --true");
      const args = {
        appCmd: {
          args: "say howmany oops -p productId --debug"
        },
        inputArgs
      };
      expect(applyArgNames(args)).toEqual({
        assignedInputArgs: {
          a: true,
          b: true,
          c: true,
          howmany: 2,
          p: "world",
          say: "hello",
          thing: 5,
          true: true
        },
        missing: ["oops"]
      });
    });
  });
});
