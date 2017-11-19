const getCommonSuffix = require("../").getCommonSuffix;

describe("prompt", () => {
  describe("common suffix", () => {
    it("returns a suffix common to a list of words", () => {
      const choices = ["abcdefg", "abcdefgh", "abcdefghi", "abcdefgB"];
      const prefix = "abcd";
      expect(getCommonSuffix(prefix, choices)).toEqual("efg");
    });

    it("returns a suffix common to a list of words", () => {
      const choices = ["abcdef", "abcdeB", "abcdeC"];
      const prefix = "abc";
      expect(getCommonSuffix(prefix, choices)).toEqual("de");
    });

    it("returns empty string when no common suffix", () => {
      const choices = ["abcdA", "abcdB", "abcdC"];
      const prefix = "abcd";
      expect(getCommonSuffix(prefix, choices)).toEqual("");
    });
  });
});
