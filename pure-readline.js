/*
http://slides.com/glenarrowsmith/writing-node-js-command-line-tools#/
http://thisdavej.com/making-interactive-node-js-console-apps-that-listen-for-keypress-events/
*/

const readline = require("readline");
const chalk = require("chalk");
const debug = require("./lib/debug");

const nonPrintable = {
  tab: true,
  up: true,
  down: true,
  left: true,
  right: true,
  backspace: true
};

function Makitso(arg0) {
  const {
    prompt,
    input = process.stdin,
    output = process.stdout,
    readline: rl = readline.createInterface({ input, output })
  } = arg0;

  const makitso = {
    rl,
    command: "",
    cursorX: 0,
    prompt,
    history: [""],
    historyIdx: -1,

    cursorMove(n) {
      if (this.cursorX + n >= 0 && this.cursorX + n <= this.command.length) {
        this.cursorX = this.cursorX + n;
        return true;
      }
      return false;
    },

    commandInsert(idx, str) {
      const prefix = this.command.slice(0, idx);
      const suffix = this.command.slice(idx);
      debug({ prefix, suffix, x: idx });
      this.command = `${prefix}${str}${suffix}`;
      this.cursorMove(str.length);
    },

    commandRemove(idx) {
      if (this.cursorMove(-1)) {
        const prefix = this.command.slice(0, idx);
        const suffix = this.command.slice(idx + 1);
        debug({ prefix, suffix, x: idx });
        this.command = `${prefix}${suffix}`;
      }
    },

    commandSet(command) {
      this.command = command;
      this.cursorX = command.length;
    },

    commandClear() {
      if (this.history[0]) {
        this.history.unshift("");
      }
      this.historyIdx = 0;
      this.command = "";
      this.cursorX = 0;
    },

    setPrompt(newPrompt) {
      this.prompt = newPrompt || prompt;
    },

    onKeyPress(input, key) {
      debug({
        key: key.name,
        history: this.history,
        historyIdx: this.historyIdx
      });
      this.rl.line = "";
      if (key.name === "enter" || key.name === "return") {
        return;
      }
      if (key.ctrl && key.name === "c") {
        this.close();
        return;
      }
      if (nonPrintable[key.name]) {
        if (key.name === "left") {
          this.cursorMove(-1);
        }
        if (key.name === "right") {
          this.cursorMove(+1);
        }
        if (key.name === "up") {
          if (this.historyIdx < this.history.length - 1) {
            this.historyIdx++;
            this.commandSet(this.history[this.historyIdx]);
          }
        }
        if (key.name === "down") {
          if (this.historyIdx > 0) {
            this.historyIdx--;
            this.commandSet(this.history[this.historyIdx]);
          }
        }
        if (key.name === "backspace") {
          this.commandRemove(this.cursorX - 1);
        }
        this.processKeyPress(input, key);
        this.render();
        return;
      }
      if (!key.ctrl) {
        this.commandInsert(this.cursorX, key.sequence);
        this.history[0] = this.command;
      }
      this.processKeyPress(input, key);
      this.render();
    },

    onLine(line) {
      debug({ line });
      const command = this.command.trim();

      if (/^help\b/.test(command)) {
        readline.clearScreenDown(output);
        this.displayHelp(command.replace(/^help\s*/, ""));
        this.commandClear();
        this.render();
        return;
      }

      switch (command) {
        case "q":
        case "quit":
        case "exit":
          this.close();
          break;
        default:
          this.processCommand(command);
          break;
      }
    },

    displayHelp() {
      console.log("Help...");
    },

    setCommandline(newLine) {
      this.command = newLine;
    },

    appendCommandline(suffix) {
      this.setCommandline(`${this.command}${suffix}`);
    },

    processKeyPress(input, key) {
      if (key.name === "tab") {
        this.appendCommandline("bbbb");
      }
    },

    processCommand(command) {
      // console.log(`Say what? I might have heard '${line.trim()}'`);
      console.log(`Say what? I might have heard '${command}'`);
      this.commandClear();
      this.render();
    },

    close() {
      this.rl.close();
    },

    onClose() {
      console.log("\nHave a great day!");
      process.exit(0);
    },

    onPause() {
      debug("pause");
    },

    onResume() {
      debug("resume");
    },

    render() {
      readline.cursorTo(output, 0);
      readline.clearLine(output, 0);

      const cmdline = chalk`{blue ${this.prompt}${this.command}}
commands: help sos blah
something something`;
      rl.output.write(cmdline.trim());
      debug({ cmdline, length: cmdline.length });
      readline.cursorTo(output, this.cursorX + this.prompt.length);
      readline.moveCursor(output, 0, -2);
    }
  };

  readline.emitKeypressEvents(input);
  input.on("keypress", (input, key) => makitso.onKeyPress(input, key));

  rl.on("line", line => makitso.onLine(line));
  rl.on("close", () => makitso.onClose());
  rl.on("pause", () => makitso.onPause());
  rl.on("resume", () => makitso.onResume());

  rl.line = prompt;

  makitso.render();

  return makitso;
}

const makitso = Makitso({ prompt: "makitso> " });

const overrides = {
  displayHelp(command) {
    this.setPrompt("help> ");
    console.log(`Help for ${command || "everything"}\nhth\n`);
  }
};

Object.assign(makitso, overrides);
