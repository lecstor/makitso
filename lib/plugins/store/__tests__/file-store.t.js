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
      store.get({ propertyPath: "github.username.default" })
    ).resolves.toEqual("lecstor");
  });

  it("provides set", async () => {
    await expect(
      store.set({ propertyPath: "twitter.username.default" }, "lecstor")
    ).resolves.toEqual("lecstor");
    await expect(store.read()).resolves.toMatchSnapshot();
  });

  it("provides delete", async () => {
    await expect(
      store.delete({ propertyPath: "twitter.username.default" })
    ).resolves.toEqual("lecstor");
    await expect(store.read()).resolves.toMatchSnapshot();
  });
});
