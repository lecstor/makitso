const Commands = require("./commands");
const Stores = require("./stores");

async function plugin(args) {
  return {
    stores: Stores(args),
    commands: Commands()
  };
}

module.exports = plugin;
