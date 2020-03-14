import { Prompt } from "makitso-prompt";

import { Context } from "../index";
import { MemoryStore } from "../../plugins/stores/memory-store";

let prompt: Prompt;

function nextInput(username: string) {
  (prompt.start as jest.Mock).mockReturnValueOnce(Promise.resolve(username));
}

describe("get", () => {
  beforeEach(() => {
    prompt = new Prompt();
    prompt.start = jest.fn();
  });
  it("prompts for a missing value, stores, and returns the answer", async () => {
    nextInput("lecstor");
    const session = new MemoryStore();
    const schema = {
      github: {
        username: {
          store: "session",
          ask: {
            prompt: `Enter your username.. `
          }
        }
      }
    };
    const context = Context({
      schema,
      stores: { session },
      prompt,
      commands: {}
    });

    let result = await context.get("github.username");
    expect(result).toEqual("lecstor");

    expect(prompt.start).lastCalledWith({
      default: undefined,
      footer: "",
      header: "",
      prompt: "Enter your username.. ",
      maskInput: false
    });

    result = await session.get({ propertyPath: "github.username.default" });
    expect(result).toEqual("lecstor");
  });

  it("prompts with a default value, stores, and returns the answer", async () => {
    nextInput("lecstor");
    const session = new MemoryStore();
    const schema = {
      github: {
        username: {
          store: "session",
          ask: {
            prompt: `Enter your username.. `,
            default: "lecstor"
          }
        }
      }
    };
    const context = Context({
      schema,
      stores: { session },
      prompt,
      commands: {}
    });

    let result = await context.get("github.username");
    expect(result).toEqual("lecstor");

    // prompt was called with default
    expect(prompt.start).lastCalledWith({
      default: "lecstor",
      footer: "",
      header: "",
      prompt: "Enter your username.. ",
      maskInput: false
    });

    // the result was saved to the store
    result = await session.get({ propertyPath: "github.username.default" });
    expect(result).toEqual("lecstor");
  });

  it("prompts with the value from the store as default, stores, and returns the answer", async () => {
    nextInput("lecstor");
    const session = new MemoryStore({
      data: { github: { username: { default: "lastUsed" } } }
    });
    const schema = {
      github: {
        username: {
          store: "session",
          ask: {
            prompt: `Enter your username.. `,
            default: "lecstor",
            storedValueIs: "default"
          }
        }
      }
    };
    const context = Context({
      schema,
      stores: { session },
      prompt,
      commands: {}
    });

    let result = await context.get("github.username");
    expect(result).toEqual("lecstor");

    // prompt was called with the value in the store
    expect(prompt.start).lastCalledWith({
      default: "lastUsed",
      footer: "",
      header: "",
      prompt: "Enter your username.. ",
      maskInput: false
    });

    // the result was saved to the store
    result = await session.get({ propertyPath: "github.username.default" });
    expect(result).toEqual("lecstor");
  });

  it("gets an existing value without prompt", () => {
    const session = new MemoryStore({
      data: { github: { username: { default: "lecstor" } } }
    });
    const schema = {
      github: {
        username: {
          store: "session",
          ask: {
            prompt: `Enter your username.. `,
            default: "lecstor",
            storedValueIs: "response"
          }
        }
      }
    };
    const context = Context({
      schema,
      stores: { session },
      prompt,
      commands: {}
    });
    return expect(context.get("github.username")).resolves.toEqual("lecstor");
  });
});
