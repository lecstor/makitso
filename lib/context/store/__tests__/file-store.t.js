jest.mock("fs");

const fs = require("fs");
const { promisify } = require("util");

const writeFile = promisify(fs.writeFile);

const Store = require("../file-store");

beforeAll(() => {
  return writeFile(
    "file.json",
    `{"github":{"username":{"default":"lecstor"}}}`,
    "utf8"
  );
});

describe("File Store", () => {
  const store = Store({ file: "file.json" });

  it("provides get", async () => {
    await expect(
      store.get({ prop: { name: "github.username" } })
    ).resolves.toEqual("lecstor");
  });

  it("provides set", async () => {
    await expect(
      store.set({ prop: { name: "twitter.username" }, value: "lecstor" })
    ).resolves.toEqual("lecstor");
    await expect(
      store.get({ prop: { name: "twitter.username" } })
    ).resolves.toEqual("lecstor");
  });

  it("provides delete", async () => {
    await expect(
      store.delete({ prop: { name: "twitter.username" } })
    ).resolves.toEqual("lecstor");
    await expect(
      store.get({ prop: { name: "twitter.username" } })
    ).resolves.toBeUndefined();
  });
});
