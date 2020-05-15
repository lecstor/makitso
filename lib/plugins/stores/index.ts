import { FileStore, FileStoreArgs } from "./file-store";
import { KeychainStore } from "./keychain-store";
import { MemoryStore, MemoryStoreArgs } from "./memory-store";

export * from "./types";

export type PluginArgs = {
  session: MemoryStoreArgs;
  file: FileStoreArgs;
};

type Plugin = {
  secure: KeychainStore;
  session: MemoryStore;
  file?: FileStore;
};

export async function plugin(args: PluginArgs) {
  const { session = { data: {} }, file } = args;
  const plugin: Plugin = {
    secure: new KeychainStore(),
    session: new MemoryStore(session)
  };
  if (file) {
    plugin.file = await new FileStore(file).load();
  }
  return plugin;
}
