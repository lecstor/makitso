const FileStore = require("./file-store");
const KeychainStore = require("./keychain-store");
const MemoryStore = require("./memory-store");

async function plugin(args) {
  const { session, file } = args;
  return {
    file: await FileStore(file),
    secure: KeychainStore(),
    session: MemoryStore(session)
  };
}

module.exports = plugin;
