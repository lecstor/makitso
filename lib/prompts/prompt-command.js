const Prompt = require("prompt-base");
const debug = require("../debug");
const chalk = require("chalk");
const _isArray = require("lodash/isArray");
const rlUtils = require("readline-utils");

function Autocomplete(/* question, answers, rl */) {
  Prompt.apply(this, arguments);
}

Prompt.extend(Autocomplete);

/**
 * (Re-)render the prompt message, along with any help or error
 * messages, user input, choices, list items, and so on. This is
 * called to render the initial prompt, then it's called again
 * each time the prompt changes, such as on keypress events (when
 * the user enters input, or a multiple-choice option is selected).
 * This method may be overridden in custom prompts, but it's
 * recommended that you override the more specific render "status"
 * methods instead.
 *
 * ```js
 * prompt.ui.on('keypress', prompt.render.bind(prompt));
 * ```
 * @return {undefined}
 * @api public
 */

Autocomplete.prototype.render = async function(state) {
  if (typeof state === "undefined") {
    state = this.state;
  }
  this.state = state;
  const context = (this.context = {
    options: this.options,
    status: this.status,
    state: this.state,
    line: this.rl.line,
    keypress: this.keypress,
    answer: this.answer,
    default: this.getDefault(),
    original: this.renderMessage(this),
    banner: "",
    header: "",
    prefix: this.prefix,
    message: this.message,
    input: "",
    footer: "",
    append: "",
    output: "",
    error: "",
    hint: "",
    help: ""
  });

  context.append =
    this.renderError(context) || (await this.renderStatus(context));
  context.message = this.renderMessage(context);

  // override message in custom prompts
  this.emit("render", context);

  // render message with default settings
  switch (context.status) {
    case "help":
    case "pending":
    case "expanded":
    case "initialized":
      context.message += this.renderHelp(context);
      context.message += this.renderBody(context);
      context.message += this.renderFooter(context);
      break;
    case "answered":
      context.message += this.renderAnswer(context);
      context.answer = this.answer;
      break;
    case "interacted":
    case "submitted":
    default: {
      context.message += this.renderBody(context);
      context.message += this.renderFooter(context);
      break;
    }
  }

  // push context onto history array, for debugging
  this.contextHistory.push(context);
  debug({ render: `"${context.message}" "${context.append}"` });
  debug({ render1: this.rl.line });
  this.ui.render(context.message, context.append);
  debug({ render2: this.rl.line });
};

Autocomplete.prototype.renderBody = function(context) {
  const body = this.body || this.rl.line;
  this.body = null;
  debug({ body });
  return body;
};

Autocomplete.prototype.renderStatus = async function(context) {
  if (this.helperMeta === undefined) {
    this.helperMeta = await this.options.helper(this.rl.line.trim());
  }
  debug({ helperMeta: this.helperMeta });
  const {
    choices,
    description,
    options,
    hasAction,
    input = {}
  } = this.helperMeta;
  const hint = description || "---";
  const nextArg = input.missing && input.missing[0];
  debug({ nextArg });
  if (choices) {
    if (_isArray(choices)) {
      if (choices.length) {
        if (choices.length === 1) {
          return chalk`{green >>} {gray ${
            choices[0]
          }} {dim (Hit Tab to complete)}\n${description || "---"}\n`;
        }
        let label;
        if (nextArg) {
          label = `Enter ${nextArg.description}`;
        } else {
          label = hasAction ? "args" : "commands";
        }
        const choiceStr = choices.sort().join(" ");
        return chalk`{blue ${label}:} {gray ${choiceStr}}\n${hint}\n`;
      }
    } else {
      if (nextArg) {
        return chalk`{blue Enter ${nextArg.description}}\n${hint}\n`;
      }
    }
  } else if (options && options.length) {
    const optionsStr = options.sort().join("\n    ");
    return chalk`{dim options:}\n    {gray ${optionsStr}}\n${hint}\n`;
  }
  return chalk`{green >>} {gray Hit Enter to run it}\n{gray ${hint}}\n`;
};

Autocomplete.prototype.getError = function() {
  debug({ getErrorHelperMeta: this.helperMeta });
  const { input, description } = this.helperMeta;
  const nextArg = (input && input.missing && input.missing[0]) || "error";
  const hint = description || "---";
  return chalk`{red >>>} {blue Enter ${nextArg.description}}\n${hint}\n`;
};

Autocomplete.prototype.completeIt = async function() {
  let line = this.rl.line;
  if (this.helperMeta === undefined) {
    this.helperMeta = await this.options.helper(line);
  }
  const { choices } = this.helperMeta;
  debug({ choices });
  if (choices && choices.length === 1) {
    line = line.split(/\s/);
    line.pop();
    line.push(choices[0]);
    const completed = line.join(" ") + " ";
    this.rl.pause();
    this.rl.line = completed;
    this.rl.cursor = completed.length;
    debug({ status: this.context.status });
    this.body = completed;
    this.render();
    this.rl.resume();
  }
};

Prompt.prototype.dispatch = async function(input, key) {
  debug({ dispatch: { input, key } });
  debug({ dispatchThisRlLine1: this.rl.line });
  this.keypress = key;
  this.choices.position = this.position;
  var self = this;

  // don't handle "enter" and "return" (handle by "line")
  if (key.name === "enter" || key.name === "return") {
    return;
  }

  if (key.name === "line") {
    this.status = "submitted";
    input = this.answer = this.getAnswer(input, key);
    debug({ dispatchThisRlLine2: this.rl.line });
    debug({ dispatchAnswerInput: input });
  }

  // dispatch actions, if one matches a keypress
  var action = self.action(key.name);
  debug({ dispatchThisRlLine3: this.rl.line });

  if (typeof action === "function") {
    this.position = action.call(this.actions, this.position, key);
    debug({ dispatchThisRlLine4: this.rl.line });
  }

  try {
    if (key.name === "tab") {
      debug("call completeIt");
      this.rl.line = this.rl.line.trim();
      await this.completeIt();
    }
    debug({ keyName: key.name });
    if (key.name !== "line") {
      debug({ dispatchThisRlLine5: this.rl.line });
      this.helperMeta = await this.options.helper(this.rl.line.trim());
    }

    self.render();
    debug({ dispatchThisRlLine6: this.rl.line });

    // let state;
    if (key.name === "line") {
      // state = await this.validate(input);
      // debug({ validState: state });
      // if (state === true) {
      //   return self.submitAnswer(input);
      // }
      debug({ dispatchLineInput: input });
      this.helperMeta = await this.options.helper(input);
      debug({ dispatchThisRlLine7: this.rl.line });
      debug({ dispatchLineHelperMeta: this.helperMeta });
      if (this.helperMeta.hasAction && !this.helperMeta.input.missing) {
        self.submitAnswer(input);
        debug({ dispatchThisRlLine8: this.rl.line });
      } else {
        this.rl.line = input;
        this.state = false;
        self.render();
      }
    }
  } catch (error) {
    this.onError(error);
  }
};

module.exports = Autocomplete;
