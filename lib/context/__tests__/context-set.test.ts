import { Context } from "../index";
import { MemoryStore } from "../../plugins/stores/memory-store";

describe("set", () => {
  it("sets a value with no variant specified (default)", async () => {
    const session = new MemoryStore();
    const schema = { github: { username: { store: "session" } } };
    const context = Context({ schema, stores: { session }, commands: {} });

    let result = await context.set("github.username", "lecstor");
    expect(result).toEqual("lecstor");

    // the result was saved to the store
    result = await session.get({ propertyPath: "github.username.default" });
    expect(result).toEqual("lecstor");

    result = await session.read();
    expect(result).toEqual({
      github: { username: { default: "lecstor" } }
    });
  });

  it("sets a value with a variant", async () => {
    const session = new MemoryStore();
    const schema = { github: { username: { store: "session" } } };
    const context = Context({ schema, stores: { session }, commands: {} });

    let result = await context.set("github.username.work", "lecstor");
    expect(result).toEqual("lecstor");

    // the result was saved to the store
    result = await session.get({
      propertyPath: "github.username.work"
    });
    expect(result).toEqual("lecstor");

    result = await session.read();
    expect(result).toEqual({
      github: { username: { work: "lecstor" } }
    });
  });
});
