## Makitso

A Framework for building composable interactive commandline apps.

The goal is to have a framework that can be used to build a single customised
commandline app that developers in an organisation can easily install and use
to do common tasks, hopefully without much instruction.

To that end, Makitso allows a nested command structure, suggestions and
auto-complete for commands and arguments, and prompting and storage of
configuration properties specific to the user (or app, workspace, etc).

Makitso plugin modules can be used to define commands, context (config) schema,
and storage options. Once defined, context values can be used by commands from
other plugins. If a value is not set the user is prompted to provide it. Once
set, the value can be used as a default answer to a prompt, or returned to the
command directly, depending on it's configuration.

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
        ask: {
          header: `We'll only ask once..`,
          prompt: `{variant} name> `,
          footer: `Run this command again when you're done.`
        }
      }
    }
  }
}
```

### Commands Definition

Commands define the arguments and options format, help description, an action
function, and optional suggest function for autocomplete.

Commands can be nested to allow grouping commands as sub-commands.
Suggestions and auto-complete are supported for each of the command levels.

Commands can also provide a "suggest" function which will allow autocomplete to
provide available options for the command.

Command action functions receive context & input objects which gives access to
properties handled by other plugins and the current command on the commandline.
If a required property has not already been set then the plugin which is handling
it will prompt the user to enter it and then return the entered value.

`arguments` define the positional command arguments. The last argument may be
`[optional]`, a `list..`, or `[both...]`.

`description` is displayed as part of the `help` command and as inline helpers
in the input prompts.

`action` is the code to run when the command is used. It receives an object as
it's only arg, containing the context instance and an input object containing
the command arguments and options entered. It can get and set context properties
defined in the context schema and run custom code to get stuff done.

`suggest` recieves the same argiments as `action` and returns a list of commands
or arguments which are displayed to the user. This list is later filtered using
the partial command or argument entered by the user. Auto-complete can be triggered
by the user with the tab key.

```js
const Makitso = require("makitso");

const commands = {
  up: {
    description: "Bring up one or more services with docker compose",
    arguments: ["services... - the service/s to bring up"],
    action: async ({ context, input }) => {
      const services = input.args.services.join(" ");
      console.log(`shelljs.exec docker-compose up -d ${services}`);
    },
    suggest: async ({ context, input }) => {
      // read and parse docker-compose.yml and return the services keys
      return ["foo", "bar", "baz"];
    }
  },
  down: {
    description: "Bring down the stack",
    action: async ({ context, input }) => {
      console.log(`shelljs.exec docker-compose down`);
    }
  }
};

const myMakitsoPlugin = { commands };

Makitso({ plugins: myMakitsoPlugin }).catch(console.error);
```

See [examples](./examples) for examples of different Makitso features.

```
$ yarn global add makitso
$ makitso
```
