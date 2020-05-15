import { MemoryStore } from "../memory-store";

describe("Memory Store", () => {
  const store = new MemoryStore({
    data: { github: { username: { default: "lecstor" } } }
  });
  it("provides get", async () => {
    await expect(
      store.get({ propertyPath: "github.username.default" })
    ).resolves.toEqual("lecstor");
  });

  it("provides set", async () => {
    await expect(
      store.set({ propertyPath: "twitter.username.default" }, "lecstor")
    ).resolves.toEqual("lecstor");
    await expect(
      store.get({ propertyPath: "twitter.username.default" })
    ).resolves.toEqual("lecstor");
  });

  it("provides delete", async () => {
    await expect(
      store.delete({ propertyPath: "twitter.username.default" })
    ).resolves.toEqual("lecstor");
    await expect(
      store.get({ propertyPath: "twitter.username.default" })
    ).resolves.toBeUndefined();
  });
});
