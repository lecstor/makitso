Makitso
-------

A Framework for building composable interactive commandline apps.

With Makitso you can build interactive commandline apps with simple plugin
modules which define commands, a property schema, and/or storage
connectors.

The schema defines context properties, the storage to use, and a prompt for
collecting the value of the property.
```
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

Commands define the command format, help description and an action function.
Action functions recieve the app context and arguments from the commandline.
```
{
  commands: {
    set: {
      command: "set <prop> <value>",
      description: "Set a context value",
      action: (context, prop, value) => context.set(prop, value)
    },
    printName: {
      description: "Print your name",
      action: async (context) => {
        const firstName = await context.get("my.name.first");
        const lastName = await context.get("my.name.last");
        console.log(`${firstName} ${lastName}`);
      }
    }
  }
}
```
Usage
```
$ makitso
? Makitso> printName
? Enter your first name ... Jason
? Enter your last name ... Galea
Jason Galea
? Makitso> printName
Jason Galea
? Makitso>
```

Command actions are provided with a context which can be used to access
properties such as usernames, passwords, urls, or anything else they need,
provided there is a plugin which handles those properties. If the required
values have not already been set then the handler plugin will ask the user
to enter them and then return them to the command.

See the [builtin app](./bin/index.js) for an example or install this module
globally and try it for yourself.

```
$ yarn global add makitso
$ makitso
```

Makitso uses [commander](https://github.com/tj/commander.js),
[inquirer](https://github.com/SBoudrias/Inquirer.js/),
[inquirer-command-promt](https://github.com/sullof/inquirer-command-prompt),
and some custom plumbing to hook them up to session (memory), file, and secure
(keychain) context storage.

