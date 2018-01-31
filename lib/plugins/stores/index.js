const FileStore = require("./file-store");
const KeychainStore = require("./keychain-store");
const MemoryStore = require("./memory-store");

async function plugin(args) {
  const { session = { data: {} }, file } = args;
  const plugin = {
    secure: KeychainStore(),
    session: MemoryStore(session)
  };
  if (file) {
    plugin.file = await FileStore(file);
  }
  return plugin;
}

module.exports = plugin;
