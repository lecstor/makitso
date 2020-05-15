import fs from "fs";
import { promisify } from "util";
import { FileStore } from "../file-store";

const writeFile = promisify(fs.writeFile);

jest.mock("fs");

beforeAll(() => {
  return writeFile(
    "file.json",
    `{"github":{"username":{"default":"lecstor"}}}`,
    "utf8"
  );
});

describe("File Store", () => {
  let store: FileStore;

  beforeAll(async () => {
    store = await new FileStore({ path: "file.json" }).load();
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
    await expect(store.read()).resolves.toMatchSnapshot();
  });

  it("provides delete", async () => {
    await expect(
      store.delete({ propertyPath: "twitter.username.default" })
    ).resolves.toEqual("lecstor");
    await expect(store.read()).resolves.toMatchSnapshot();
  });
});
