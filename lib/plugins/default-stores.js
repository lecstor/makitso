const FileStore = require("./store/file-store");
const KeychainStore = require("./store/keychain-store");
const MemoryStore = require("./store/memory-store");

function plugin(args) {
  const { data, file } = args;
  return {
    stores: {
      file: FileStore({ file }),
      secure: KeychainStore(),
      session: MemoryStore({ data })
    }
  };
}

module.exports = plugin;
