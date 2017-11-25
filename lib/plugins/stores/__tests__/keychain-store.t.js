jest.mock("keytar");

const Store = require("../keychain-store");
const prop = {
  path: "twitter.password",
  storeOptions: {
    service: "twitter.password",
    account: "{variant}"
  }
};

describe("Keychain Store", () => {
  const store = Store();

  it("provides set", async () => {
    await expect(
      // store.set({ prop, variant: "lecstor", value: "mySecret" })
      store.set(prop, "mySecret")
    ).resolves.toEqual("mySecret");
    await expect(store.get(prop)).resolves.toEqual("mySecret");
  });

  it("provides get", async () => {
    await expect(store.get(prop)).resolves.toEqual("mySecret");
  });

  it("provides delete", async () => {
    await expect(store.delete(prop)).resolves.toBe(true);
    await expect(store.get(prop)).resolves.toBe(null);
  });
});
