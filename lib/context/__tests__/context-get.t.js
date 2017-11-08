jest.mock("inquirer");

const inquirer = require("inquirer");
const Context = require("../index");
const Session = require("../store/memory-store");

describe("get", () => {
  it("prompts for a missing value, stores, and returns the answer", async () => {
    inquirer.prompt.mockReturnValue("lecstor");
    const session = Session();
    const schema = {
      github: {
        username: {
          store: "session",
          prompt: {
            type: "input",
            name: "username",
            message: `Enter your username...`
          }
        }
      }
    };
    const context = Context({ schema, stores: { session } });
    await expect(context.get("github.username")).resolves.toEqual("lecstor");
    expect(inquirer.prompt).lastCalledWith({
      message: "Enter your username...",
      name: "username",
      type: "input"
    });
    await expect(
      session.get({ prop: { name: "github.username" } })
    ).resolves.toEqual("lecstor");
  });

  it("prompts with a default value, stores, and returns the answer", async () => {
    inquirer.prompt.mockReturnValue("lecstor");
    const session = Session();
    const schema = {
      github: {
        username: {
          store: "session",
          prompt: {
            type: "input",
            name: "username",
            message: `Enter your username...`
          },
          promptWithDefault: true,
          default: "lecstor"
        }
      }
    };
    const context = Context({ schema, stores: { session } });
    await expect(context.get("github.username")).resolves.toEqual("lecstor");

    // prompt was called with default
    expect(inquirer.prompt).lastCalledWith({
      default: "lecstor",
      message: "Enter your username...",
      name: "username",
      type: "input"
    });

    // the result was saved to the store
    await expect(
      session.get({ prop: { name: "github.username" } })
    ).resolves.toEqual("lecstor");
  });

  it("prompts with the value from the store as default, stores, and returns the answer", async () => {
    inquirer.prompt.mockReturnValue("lecstor");
    const session = Session({ github: { username: { default: "lastUsed" } } });
    const schema = {
      github: {
        username: {
          store: "session",
          prompt: {
            type: "input",
            name: "username",
            message: `Enter your username...`
          },
          promptWithDefault: true,
          default: "lecstor"
        }
      }
    };
    const context = Context({ schema, stores: { session } });
    await expect(context.get("github.username")).resolves.toEqual("lecstor");

    // prompt was called with the value in the store
    expect(inquirer.prompt).lastCalledWith({
      default: "lastUsed",
      message: "Enter your username...",
      name: "username",
      type: "input"
    });

    // the result was saved to the store
    await expect(
      session.get({ prop: { name: "github.username" } })
    ).resolves.toEqual("lecstor");
  });

  it("gets an existing value without prompt", () => {
    const session = Session({ github: { username: { default: "lecstor" } } });
    const schema = { github: { username: { store: "session" } } };
    const context = Context({ schema, stores: { session } });
    return expect(context.get("github.username")).resolves.toEqual("lecstor");
  });
});
