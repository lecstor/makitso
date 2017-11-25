const chalk = require("chalk");
const term = require("terminal-kit").terminal;
const ellipsize = require("ellipsize");
const _forEach = require("lodash/forEach");
const _trim = require("lodash/trim");
const InputPrompt = require("inquirer/lib/prompts/input");

const histories = {};
const historyIndexes = {};
const autoCompleters = {};

let context;

/**
 * Returns the shortest string from a list
 *
 * @param {String[]} choices - a list of strings
 * @returns {String} shortest choice
 */
function findShortest(choices = []) {
  return choices.reduce(
    (short, choice) => (choice.length < short.length ? choice : short),
    choices[0]
  );
}

/**
 * Find a string which follows the prefix in all choices
 *
 * @param {String} prefix - all choices start with this
 * @param {String[]} choices - possible options
 * @returns {String} common suffix
 */
function getCommonSuffix(prefix, choices) {
  const start = prefix.length;
  const maybeSuffix = findShortest(choices).slice(start);
  let suffix = "";
  let looking = true;
  _forEach(maybeSuffix, (char, idx) => {
    const pos = start + idx;
    _forEach(choices, choice => {
      looking = choice[pos] === char;
      return looking;
    });
    if (looking) {
      suffix = `${suffix}${char}`;
    }
    return looking;
  });
  return suffix;
}

/**
 * Compare commandline with possible matches
 *
 * @param {String} line - current command line input
 * @param {Function|Array} choices - a list of autocomplete possibilities
 * @returns {Object} matches
 */
async function autoCompleter(line, choices) {
  const words = line.split(/\s+/);
  const partial = words.pop();
  const complete = _trim(words.join(" "));

  if (typeof choices === "function") {
    choices = (await choices(complete)) || [];
  }

  // filter valid options to those that start with
  // our partial from the commandline
  const matchingChoices = choices.reduce(
    (list, el) => (el.startsWith(partial) ? [...list, el] : list),
    []
  );

  const completeMatch = complete ? `${complete} ` : "";

  if (matchingChoices.length > 1) {
    const commonSuffix = getCommonSuffix(partial, matchingChoices);
    if (commonSuffix) {
      return { match: `${line}${commonSuffix}`, matches: matchingChoices };
    }
    return { matches: matchingChoices };
  } else if (matchingChoices.length === 1) {
    return {
      match: `${completeMatch}${matchingChoices[0]} `
    };
  }
  return { match: completeMatch };
}

/**
 * Update the commandline and/or display options
 *
 * @param {String} context - context identifier
 * @param {String} line - current text on the commandline
 * @param {Function} rewrite - updates the commandline
 * @returns {void}
 */
async function autoComplete(context, line, rewrite) {
  line = line
    .replace(/^ +/, "")
    .replace(/\t/, "")
    .replace(/ +/g, " ");

  try {
    const ac = await autoCompleters[context](line);
    if (ac.matches) {
      term.moveTo(0, term.height);
      term.eraseLine();
      term(chalk.green(">> "));
      term.gray(formatList(ac.matches));
      term.moveTo(0, term.height - 1);
    }
    if (ac.match || ac.match === "") {
      rewrite(ac.match);
    } else {
      rewrite(line);
    }
  } catch (e) {
    console.error(e);
    rewrite(line);
  }
}

function setSpaces(str, length, ellipsized) {
  if (ellipsized && str.length > length - 4) {
    return ellipsize(str, length - 4) + " ".repeat(4);
  }
  const newStr = str + " ".repeat(length - str.length);
  return newStr;
}

function formatList(elems, maxSize = 40, ellipsized) {
  const cols = process.stdout.columns;
  let max = 0;
  for (let elem of elems) {
    max = Math.max(max, elem.length + 4);
  }
  if (ellipsized && max > maxSize) {
    max = maxSize;
  }
  let columns = (cols / max) | 0;
  let str = "";
  let c = 1;
  for (let elem of elems) {
    str += setSpaces(elem, max, ellipsized);
    if (c === columns) {
      str += " ".repeat(cols - max * columns);
      c = 1;
    } else {
      c++;
    }
  }
  return str;
}

class CommandPrompt extends InputPrompt {
  async onKeypress(e) {
    const rewrite = line => {
      this.rl.line = line;
      this.rl.write(null, { ctrl: true, name: "e" });
    };
    context = this.opt.context ? this.opt.context : "_default";

    if (!histories[context]) {
      histories[context] = [];
      historyIndexes[context] = 0;
      if (this.opt.autoCompletion) {
        autoCompleters[context] = l =>
          autoCompleter(l, this.opt.autoCompletion);
      } else {
        autoCompleters[context] = () => [];
      }
    }

    /** go up commands history */
    if (e.key.name === "up") {
      if (historyIndexes[context] > 0) {
        historyIndexes[context]--;
        rewrite(histories[context][historyIndexes[context]]);
      }
    } else if (e.key.name === "down") {
      /** go down commands history */
      if (histories[context][historyIndexes[context] + 1]) {
        historyIndexes[context]++;
        rewrite(histories[context][historyIndexes[context]]);
      }
    } else if (e.key.name === "tab") {
      await autoComplete(context, this.rl.line, rewrite);
    }
    this.render();
  }

  run() {
    return new Promise(
      function(resolve) {
        this._run(function(value) {
          if (value && context && histories[context]) {
            histories[context].push(value);
            historyIndexes[context]++;
          }
          resolve(value);
        });
      }.bind(this)
    );
  }
}

exports = module.exports = CommandPrompt;
CommandPrompt.getCommonSuffix = getCommonSuffix;
