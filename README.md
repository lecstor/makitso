## Makitso

A Framework for building composable interactive commandline apps.

With Makitso you can build interactive commandline apps with simple plugin
modules which define commands, property schemas, storage connectors, and
[enquirer](https://github.com/enquirer/enquirer) commandline prompts.

### Context Schema

The schema defines context properties, the storage to use, and a prompt for
collecting the value of the property. Property values are stored in the memory,
file, or keychain stores for immediate and later use. When an unset value is
requested by a command action the user is prompted for the required value and it
is stored in context and returned to the action.

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

### Commands Definition

Commands define the command arguments and options format, help description, an
action function, and optional choices function for autocomplete.

Commands can be grouped using the plugin's config.command property for all
commands in the plugin, and by using object nesting within the plugin.
Autocomplete is supported for each of the command levels.

Commands can also provide a "choices" function which will allow autocomplete to
provide available options for the command.

Command action functions receive a context instance which gives access to
properties handled by other plugins. If a required property has not already been
set then the plugin which is handling it will prompt the user to enter it and
then return the entered value.

`args` define the positional command arguments. The last argument may be
[optional], a list[], or [both[]].

`description` is displayed as part of the `help` command and as inline helpers
in the input prompts.

`action` is the code to run when the command is used. It receives an object as
it's only arg, containing the context instance and an input object containing
the command arguments and options entered. It can get and set context properties
defined in the context schema and run custom code to get stuff done.

```js
{
  commands: {
    set: {
      args: "prop value",
      description: "Set a context value",
      action: ({ context, input }) => {
        const { prop, value } = input.args;
        context.set(prop, value)
      })
    },
    printName: {
      description: "Print your name",
      action: async ({ context }) => {
        const firstName = await context.get("my.name.first");
        const lastName = await context.get("my.name.last");
        console.log(`${firstName} ${lastName}`);
      }
    },
    debug: {
      on: {
        description: "Turn on debugging",
        action: async ({ context }) => {
          process.env.DEBUG = 'makitso';
          console.log("Debug On")
        }
      },
      off: {
        description: "Turn off debugging",
        action: async ({ context }) => {
          process.env.DEBUG = '';
          console.log("Debug Off")
        }
      }
    },
    dump: {
      store: {
        args: "storeId",
        description: "Dump the store",
        choices: ({ context, input }) => {
          if (!input.args.storeId) {
            return context.listStores();
          }
          return [];
        },
        action: async ({ context, input }) => {
          const { storeId } = input.args;
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
