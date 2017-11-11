const _merge = require("lodash/merge");

const cmd = require("./lib/program");
const Context = require("./lib/context");

function registerPlugin({ schema, stores, commands, plugin }) {
  _merge(schema, plugin.schema);
  _merge(stores, plugin.stores);
  _merge(commands, plugin.commands);
  return { schema, stores, commands };
}

function CommandIt({ options }) {
  let schema = {};
  let stores = {};
  let commands = {};

  return {
    registerPlugins(plugins) {
      if (!Array.isArray(plugins)) {
        ({ schema, stores, commands } = registerPlugin({
          schema,
          stores,
          commands,
          plugin: plugins
        }));
      } else {
        plugins.forEach(
          plugin =>
            ({ schema, stores, commands } = registerPlugin({
              schema,
              stores,
              commands,
              plugin
            }))
        );
      }
    },
    start() {
      const context = Context({ schema, stores });
      cmd(context, commands, options);
    }
  };
}

module.exports = CommandIt;
