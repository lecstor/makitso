const parse = require("../args");

describe("args", () => {
  describe("parse", () => {
    test("a standard arg with a number value is always formatted as a number", () => {
      const appCmd = { args: [{ name: "std" }] };
      const cmdArgs = "123";
      expect(parse({ appCmd, cmdArgs })).toEqual({ args: { std: 123 } });
    });

    test("a standard arg with a string value is always formatted as a string", () => {
      const appCmd = { args: [{ name: "std" }] };
      const cmdArgs = "hello";
      expect(parse({ appCmd, cmdArgs })).toEqual({
        args: { std: "hello" }
      });
    });

    test('when a standard arg with no alias has multiple values supplied, the extra values are "unknown"', () => {
      const appCmd = { args: {} };
      const cmdArgs = "hello world";
      expect(parse({ appCmd, cmdArgs })).toEqual({
        args: {},
        unknownArgs: ["hello", "world"]
      });
    });

    test('undefined options are "unknown"', () => {
      const appCmd = {
        args: [{ name: "one" }],
        optsLookup: {},
        aliasLookup: {}
      };
      expect(parse({ appCmd, cmdArgs: "hello --two world -t world" })).toEqual({
        args: { one: "hello" },
        unknownOpts: [{ two: ["world"] }, { t: ["world"] }]
      });
      expect(parse({ appCmd, cmdArgs: "hello --two wor --two ld" })).toEqual({
        args: { one: "hello" },
        unknownOpts: [{ two: ["wor", "ld"] }]
      });
      expect(parse({ appCmd, cmdArgs: "hello --t wor --t ld" })).toEqual({
        args: { one: "hello" },
        unknownOpts: [{ t: ["wor", "ld"] }]
      });
    });

    test('when a standard arg has no value supplied it is named as "missing"', () => {
      const appCmd = {
        args: [{ name: "std" }, { name: "std2" }, { name: "std3" }]
      };
      const cmdArgs = "hello";
      expect(parse({ appCmd, cmdArgs })).toEqual({
        args: { std: "hello" },
        missing: [{ name: "std2" }, { name: "std3" }]
      });
    });

    test("a multi arg is always formatted as an array", () => {
      const appCmd = { args: [{ name: "multi", isMulti: true }] };
      const cmdArgs = "thing";
      expect(parse({ appCmd, cmdArgs })).toEqual({
        args: { multi: ["thing"] }
      });
    });

    test("an optional arg will not be named as missing", () => {
      const appCmd = { args: [{ name: "optional", isOptional: true }] };
      const cmdArgs = "";
      expect(parse({ appCmd, cmdArgs })).toEqual({
        args: {}
      });
    });

    test("an optional multi arg can be undefined", () => {
      const appCmd = {
        args: [
          { name: "std" },
          { name: "optMulti", isMulti: true, isOptional: true }
        ]
      };
      expect(parse({ appCmd, cmdArgs: "hello" })).toEqual({
        args: { std: "hello" }
      });
    });

    test("an optional multi arg can have a single value", () => {
      const appCmd = {
        args: [
          { name: "std" },
          { name: "optMulti", isMulti: true, isOptional: true }
        ]
      };
      expect(parse({ appCmd, cmdArgs: "hello world" })).toEqual({
        args: { std: "hello", optMulti: ["world"] }
      });
    });

    test("an optional multi arg can have multiple values", () => {
      const appCmd = {
        args: [
          { name: "std" },
          { name: "optMulti", isMulti: true, isOptional: true }
        ]
      };
      expect(parse({ appCmd, cmdArgs: "hello there, world" })).toEqual({
        args: { std: "hello", optMulti: ["there,", "world"] }
      });
    });

    test("parser errors are thrown", () => {
      const appCmd = {
        args: [{ name: "std" }],
        argsParserOpts: { coerce: { word: val => val.toLowercase() } }
      };
      const cmdArgs = "hello --word blah";
      expect(() => parse({ appCmd, cmdArgs })).toThrow(
        "val.toLowercase is not a function"
      );
    });
  });
});
