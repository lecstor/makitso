jest.mock("keytar");

const Store = require("../keychain-store");

describe("Keychain Store", () => {
  const store = Store();

  it("provides set", async () => {
    await expect(
      store.set("twitter", "lecstor", "mySecret")
    ).resolves.toBeUndefined();
    await expect(store.get("twitter", "lecstor")).resolves.toEqual("mySecret");
  });

  it("provides get", async () => {
    await expect(store.get("twitter", "lecstor")).resolves.toEqual("mySecret");
  });

  it("provides delete", async () => {
    await expect(store.delete("twitter", "lecstor")).resolves.toBe(true);
    await expect(store.get("twitter", "lecstor")).resolves.toBe(null);
  });
});
