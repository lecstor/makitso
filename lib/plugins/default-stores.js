const FileStore = require("./store/file-store");
const KeychainStore = require("./store/keychain-store");
const MemoryStore = require("./store/memory-store");

async function plugin(args) {
  const { session, file } = args;
  return {
    stores: {
      file: await FileStore(file),
      secure: KeychainStore(),
      session: MemoryStore(session)
    }
  };
}

module.exports = plugin;
