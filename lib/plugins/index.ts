const Commands = require("./commands");
const Stores = require("./stores");

async function plugin(args) {
  return {
    stores: await Stores(args),
    commands: Commands()
  };
}

module.exports = plugin;
