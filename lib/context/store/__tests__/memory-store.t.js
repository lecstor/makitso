const Store = require("../memory-store");

describe("Memory Store", () => {
  const store = Store({ github: { username: "lecstor" } });
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
