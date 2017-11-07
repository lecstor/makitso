const Context = require("../index");
const Session = require("../store/memory-store");

describe("set", () => {
  it("sets a value", async () => {
    const session = Session();
    const schema = { github: { username: { store: "session" } } };
    const context = Context({ schema, stores: { session } });
    await expect(context.set("github.username", "lecstor")).resolves.toEqual(
      "lecstor"
    );
    // the result was saved to the store
    await expect(session.get("github.username")).resolves.toEqual("lecstor");
  });
});
