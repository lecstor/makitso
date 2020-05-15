import { parse } from "./args";

describe("args", () => {
  describe("parse", () => {
    test("a standard arg with a number value is always formatted as a number", () => {
      const appCmd = { args: [{ name: "std" }] };
      const cmdArgs = "123";
      expect(parse({ appCmd, cmdArgs })).toEqual({
        args: { std: 123 },
        missing: [],
        current: "std"
        // opts: {}
      });
    });

    test("a standard arg with a string value is always formatted as a string", () => {
      const appCmd = { args: [{ name: "std" }] };
      const cmdArgs = "hello";
      expect(parse({ appCmd, cmdArgs })).toEqual({
        args: { std: "hello" },
        missing: [],
        current: "std"
        // opts: {}
      });
    });

    test('when a standard arg with no alias has multiple values supplied, the extra values are "unknown"', () => {
      const appCmd = { args: [] };
      const cmdArgs = "hello world";
      expect(parse({ appCmd, cmdArgs })).toEqual({
        args: {},
        unknownArgs: ["hello", "world"],
        missing: []
        // opts: {}
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
        unknownOpts: [{ two: ["world"] }, { t: ["world"] }],
        missing: [],
        current: "one"
      });
      expect(parse({ appCmd, cmdArgs: "hello --two wor --two ld" })).toEqual({
        args: { one: "hello" },
        unknownOpts: [{ two: ["wor", "ld"] }],
        missing: [],
        current: "one"
      });
      expect(parse({ appCmd, cmdArgs: "hello --t wor --t ld" })).toEqual({
        args: { one: "hello" },
        unknownOpts: [{ t: ["wor", "ld"] }],
        missing: [],
        current: "one"
      });
    });

    test('when a standard arg has no value supplied it is named as "missing"', () => {
      const appCmd = {
        args: [{ name: "std" }, { name: "std2" }, { name: "std3" }]
      };
      const cmdArgs = "hello";
      expect(parse({ appCmd, cmdArgs })).toEqual({
        args: { std: "hello" },
        missing: [{ name: "std2" }, { name: "std3" }],
        current: "std"
      });
    });

    test("a multi arg is always formatted as an array", () => {
      const appCmd = { args: [{ name: "multi", isMulti: true }] };
      const cmdArgs = "thing";
      expect(parse({ appCmd, cmdArgs })).toEqual({
        args: { multi: ["thing"] },
        missing: [],
        current: "multi"
      });
    });

    test("an optional arg will not be named as missing", () => {
      const appCmd = { args: [{ name: "optional", isOptional: true }] };
      const cmdArgs = "";
      expect(parse({ appCmd, cmdArgs })).toEqual({
        args: {},
        missing: [],
        current: "optional"
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
        args: { std: "hello" },
        missing: [],
        current: "std"
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
        args: { std: "hello", optMulti: ["world"] },
        missing: [],
        current: "optMulti"
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
        args: { std: "hello", optMulti: ["there,", "world"] },
        missing: [],
        current: "optMulti"
      });
    });

    test("parser errors are thrown", () => {
      const appCmd = {
        args: [{ name: "std" }],
        argsParserOpts: {
          coerce: {
            word: () => {
              throw new Error("boom");
            }
          }
        }
        // argsParserOpts: { coerce: { word: (val: string) => val.toLowercase() } }
      };
      const cmdArgs = "hello --word blah";
      expect(() => parse({ appCmd, cmdArgs })).toThrow("boom");
    });

    describe("current", () => {
      test("current is undefined when there are no defined args", () => {
        const appCmd = {
          args: []
        };
        expect(parse({ appCmd, cmdArgs: "", cmdLine: "do " })).toEqual({
          args: {},
          missing: []
        });
      });

      test("current is first arg when there is no input", () => {
        const appCmd = {
          args: [{ name: "first" }, { name: "second" }]
        };
        expect(parse({ appCmd, cmdArgs: "", cmdLine: "do " })).toEqual({
          args: {},
          current: "first",
          missing: [{ name: "first" }, { name: "second" }]
        });
      });

      test("current is first arg when there is incomplete input", () => {
        const appCmd = {
          args: [{ name: "first" }, { name: "second" }]
        };
        expect(parse({ appCmd, cmdArgs: "abc", cmdLine: "do abc" })).toEqual({
          args: { first: "abc" },
          current: "first",
          missing: [{ name: "second" }]
        });
      });

      test("current is second arg when there is complete input for first", () => {
        const appCmd = {
          args: [{ name: "first" }, { name: "second" }]
        };
        expect(parse({ appCmd, cmdArgs: "abc", cmdLine: "do abc " })).toEqual({
          args: { first: "abc" },
          current: "second",
          missing: [{ name: "second" }]
        });
      });

      test("current is second arg when there is complete input for first", () => {
        const appCmd = {
          args: [{ name: "first" }, { name: "second" }]
        };
        expect(
          parse({ appCmd, cmdArgs: "abc def", cmdLine: "do abc def" })
        ).toEqual({
          args: { first: "abc", second: "def" },
          current: "second",
          missing: []
        });
      });
    });
  });
});
