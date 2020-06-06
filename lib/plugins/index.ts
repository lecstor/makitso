import { plugin as commandsPlugin } from "./commands";
import { plugin as storesPlugin, PluginArgs } from "./stores";

export async function plugin(args: PluginArgs) {
  return {
    stores: await storesPlugin(args),
    commands: commandsPlugin(),
  };
}
