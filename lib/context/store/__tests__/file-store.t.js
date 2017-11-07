jest.mock("fs");

const fs = require("fs");
const { promisify } = require("util");

const writeFile = promisify(fs.writeFile);

const Store = require("../file-store");

beforeAll(() => {
  return writeFile("file.json", `{"github":{ "username":"lecstor"}}`, "utf8");
});

describe("File Store", () => {
  const store = Store({ file: "file.json" });

  it("provides get", async () => {
    await expect(store.get("github.username")).resolves.toEqual("lecstor");
  });

  it("provides set", async () => {
    await expect(store.set("twitter.username", "lecstor")).resolves.toEqual(
      "lecstor"
    );
    await expect(store.get("twitter.username")).resolves.toEqual("lecstor");
  });

  it("provides delete", async () => {
    await expect(store.delete("twitter.username")).resolves.toEqual("lecstor");
    await expect(store.get("twitter.username")).resolves.toBeUndefined();
  });
});
