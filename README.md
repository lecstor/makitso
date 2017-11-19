Makitso
-------

A Framework for building composable interactive commandline apps.

With Makitso you can build interactive commandline apps with simple plugin
modules which define commands, a property schema, and/or storage
connectors.

The schema defines context properties, the storage to use, and a prompt for
collecting the value of the property.
```js
{
  schema: {
    my: {
      name: {
        store: "file",
        prompt: {
          type: "input",
          name: "name",
          message: `Enter your {variant} name ...`
        }
      }
    }
  }
}
```

Commands define the command arguments format, help description and an action
function.

Commands can be grouped using the config.command property for all
commands in the plugin, and with object nesting within the plugin. Autocomplete
will be supported for each of the command levels.

Commands can also provide a "choices" property which will allow autocomplete
to provide available options for the command.

Command action functions receive a context instance which gives access to
properties handled by other plugins. If a required property has not already
been set then the plugin which is handling it will prompt the user to enter it
and then return the entered value.

```js
{
  commands: {
    set: {
      args: "prop value",
      description: "Set a context value",
      action: (context, { prop, value }) => context.set(prop, value)
    },
    printName: {
      description: "Print your name",
      action: async (context) => {
        const firstName = await context.get("my.name.first");
        const lastName = await context.get("my.name.last");
        console.log(`${firstName} ${lastName}`);
      }
    },
    debug: {
      on: {
        description: "Turn on debugging",
        action: async context => console.log("Debug On")
      },
      off: {
        description: "Turn off debugging",
        action: async context => console.log("Debug Off");
      }
    },
    dump: {
      store: {
        args: "storeId",
        description: "Dump the store",
        choices: {
          storeId: ({ context }) => context.listStores()
        },
        action: async (context, { storeId }) => {
          const store = await context.getStore(storeId);
          console.log(JSON.stringify(await store.read(), null, 2));
        }
      }
    },
  },
  config: {
    command: "demo"
  }
}
```
Usage
```
$ makitso
? Makitso> demo printName
? Enter your first name ... Jason
? Enter your last name ... Galea
Jason Galea
? Makitso> demo printName
Jason Galea
? Makitso>
```

See the [builtin app](./bin/index.js) for an example or install this module
globally and try it for yourself.

```
$ yarn global add makitso
$ makitso
```

Makitso uses [inquirer](https://github.com/SBoudrias/Inquirer.js/),
and a modified version of [inquirer-command-promt](https://github.com/sullof/inquirer-command-prompt),
and some custom plumbing to hook them up to a central context module backed by
session (memory), file, and secure (keychain) context storage.

