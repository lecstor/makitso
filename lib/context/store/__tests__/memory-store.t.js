const Store = require("../memory-store");

describe("Memory Store", () => {
  const store = Store({ github: { username: { default: "lecstor" } } });
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
