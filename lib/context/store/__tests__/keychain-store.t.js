jest.mock("keytar");

const Store = require("../keychain-store");
const prop = {
  name: "twitter.password",
  storeOptions: {
    service: "twitter.password",
    account: "{variant}"
  }
};

describe("Keychain Store", () => {
  const store = Store();

  it("provides set", async () => {
    await expect(
      store.set({ prop, variant: "lecstor", value: "mySecret" })
    ).resolves.toBeUndefined();
    await expect(store.get({ prop, variant: "lecstor" })).resolves.toEqual(
      "mySecret"
    );
  });

  it("provides get", async () => {
    await expect(store.get({ prop, variant: "lecstor" })).resolves.toEqual(
      "mySecret"
    );
  });

  it("provides delete", async () => {
    await expect(store.delete({ prop, variant: "lecstor" })).resolves.toBe(
      true
    );
    await expect(store.get({ prop, variant: "lecstor" })).resolves.toBe(null);
  });
});
