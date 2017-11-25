const parse = require("../args");

describe("args", () => {
  describe("parse", () => {
    test("a standard arg with a number value is always formatted as a number", () => {
      const appCmd = { args: "std" };
      const cmdArgs = "123";
      expect(parse({ appCmd, cmdArgs })).toEqual({ argv: { std: 123 } });
    });

    test("a standard arg with a string value is always formatted as a string", () => {
      const appCmd = { args: "std" };
      const cmdArgs = "hello";
      expect(parse({ appCmd, cmdArgs })).toEqual({
        argv: { std: "hello" }
      });
    });

    test('when a standard arg with no alias has multiple values supplied, the extra values are "unknown"', () => {
      const appCmd = { args: "" };
      const cmdArgs = "hello world";
      expect(parse({ appCmd, cmdArgs })).toEqual({
        argv: {},
        unknown: ["hello", "world"]
      });
    });

    test("undefined options are stored as arrays", () => {
      const appCmd = { args: "one" };
      expect(parse({ appCmd, cmdArgs: "hello --two world -t world" })).toEqual({
        argv: { one: "hello", two: ["world"], t: ["world"] }
      });
      expect(parse({ appCmd, cmdArgs: "hello --two wor --two ld" })).toEqual({
        argv: { one: "hello", two: ["wor", "ld"] }
      });
    });

    test('when a standard arg has no value supplied it is named as "missing"', () => {
      const appCmd = { args: "std std2 std3" };
      const cmdArgs = "hello";
      expect(parse({ appCmd, cmdArgs })).toEqual({
        argv: { std: "hello" },
        missing: ["std2", "std3"]
      });
    });

    test("a positional arg cannot have aliases", () => {
      const appCmd = { args: "std", opts: { alias: { std: "s" } } };
      const cmdArgs = "hello world -s world";
      expect(parse({ appCmd, cmdArgs })).toEqual({
        argv: { std: "hello" },
        unknown: [{ std: "world" }, "world"]
      });
    });

    test("a multi arg is always formatted as an array", () => {
      const appCmd = { args: "multi[]" };
      const cmdArgs = "thing";
      expect(parse({ appCmd, cmdArgs })).toEqual({
        argv: { multi: ["thing"] }
      });
    });

    test("an optional arg will not be named as missing", () => {
      const appCmd = { args: "[optional]" };
      const cmdArgs = "";
      expect(parse({ appCmd, cmdArgs })).toEqual({
        argv: {}
      });
    });

    test("an optional multi arg can be undefined", () => {
      const appCmd = { args: "std [optMulti[]]" };
      expect(parse({ appCmd, cmdArgs: "hello" })).toEqual({
        argv: { std: "hello" }
      });
    });

    test("an optional multi arg can have a single value", () => {
      const appCmd = { args: "std [optMulti[]]" };
      expect(parse({ appCmd, cmdArgs: "hello world" })).toEqual({
        argv: { std: "hello", optMulti: ["world"] }
      });
    });

    test("an optional multi arg can have multiple values", () => {
      const appCmd = { args: "std [optMulti[]]" };
      expect(parse({ appCmd, cmdArgs: "hello there, world" })).toEqual({
        argv: { std: "hello", optMulti: ["there,", "world"] }
      });
    });

    test("parser errors are thrown", () => {
      const appCmd = {
        args: "std",
        opts: { coerce: { word: val => val.toLowercase() } }
      };
      const cmdArgs = "hello --word blah";
      expect(() => parse({ appCmd, cmdArgs })).toThrow(
        "val.toLowercase is not a function"
      );
    });
  });
});
