/*
http://slides.com/glenarrowsmith/writing-node-js-command-line-tools#/
http://thisdavej.com/making-interactive-node-js-console-apps-that-listen-for-keypress-events/
*/

// const readline = require("./lib/command/readline");
const readline = require("readline");
const chalk = require("chalk");
const termSize = require("term-size");
const stringWidth = require("string-width");
const _forEach = require("lodash/forEach");
const debug = require("./lib/debug");

function Makitso(arg0) {
  const {
    prompt,
    input = process.stdin,
    output = process.stdout,
    readline: rl = readline.createInterface({ input, output })
  } = arg0;

  rl.setPrompt(prompt);

  const makitso = {
    rl,

    updateTerminalSize() {
      this.size = termSize();
    },

    defaultPrompt: prompt,

    setPrompt(newPrompt) {
      this.rl.setPrompt(newPrompt || this.defaultPrompt);
    },

    onKeyPress(input, key) {
      if (key.name === "enter" || key.name === "return") {
        return;
      }
      if (key.ctrl && key.name === "c") {
        this.close();
        return;
      }
      this.render();
    },

    onSubmit(line) {
      this.clearScreenDown();
      console.log(`Submitted: ${line}`);
      this.render();
    },

    clearScreenDown() {
      readline.clearScreenDown(output);
    },

    deleteLeft() {
      this.rl._deleteLeft();
    },

    insertString(str) {
      this.rl._insertString(str);
    },

    close() {
      this.rl.close();
    },

    onClose() {
      process.exit(0);
    },

    onPause() {},

    onResume() {},

    renderPrompt({ prompt, command }) {
      return {
        before: [
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin non neque ut massa sollicitudin condimentum. Cras facilisis enim non semper.\n",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin non neque ut massa sollicitudin condimentum. Cras facilisis enim non semper.\n"
        ],
        prompt: chalk`{blue ${prompt}${command}}`,
        after: [
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin non neque ut massa sollicitudin condimentum. Cras facilisis enim non semper.\n",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin non neque ut massa sollicitudin condimentum. Cras facilisis enim non semper."
        ]
      };
    },

    renderState: {
      before: [],
      prompt: "placeholder",
      after: []
    },

    linesHeight(lines) {
      const { columns } = this.size;
      return lines.reduce((sum, line) => {
        const width = stringWidth(line);
        sum += Math.ceil(width / columns);
        return sum;
      }, 0);
    },

    getRenderState() {
      const state = this.renderState;
      // get fresh in case terminal width has changed
      state.beforeHeight = this.linesHeight(state.before);
      if (makitso.terminalSizeUpdated) {
        state.promptHeight = this.linesHeight([state.prompt]);
      }
      makitso.terminalSizeUpdated = false;
      return state;
    },

    getPromptUpHeights(cursorPos) {
      const state = this.getRenderState();

      // height from prompt to top of lines
      // cursorPos.rows > 0 tells us we're not on the first line of the prompt
      // due to terminal wrapping.
      let topHeight = state.beforeHeight + cursorPos.rows;

      const promptHeight = this.linesHeight([prompt]);
      const promptWidth = stringWidth(prompt);

      const promptHeightChanged = state.promptHeight !== promptHeight;
      const promptWidthChanged = stringWidth(state.prompt) !== promptWidth;

      if (promptHeightChanged && !promptWidthChanged) {
        // it was the terminal in the computer with the width
        topHeight -= state.promptHeight - promptHeight;
      }

      return { topHeight, promptHeight };
    },

    writeLines({ before, prompt, after }) {
      _forEach(before, line => rl.output.write(line));
      rl.output.write(prompt.trim() + "\n");
      _forEach(after, line => rl.output.write(line));
    },

    render() {
      this.renderPromise = this.renderAsync().catch(error => {
        console.error(error);
        process.exit(1);
      });
    },

    renderAsync: async function() {
      const { before, prompt, after } = await this.renderPrompt({
        prompt: this.rl._prompt,
        command: this.rl.line
      });

      let cursorPos = this.rl._getCursorPos();

      const { topHeight, promptHeight } = this.getPromptUpHeights(cursorPos);

      readline.cursorTo(output, 0);
      readline.moveCursor(output, 0, -topHeight);
      this.clearScreenDown();

      this.writeLines({ before, prompt, after });

      cursorPos = this.rl._getCursorPos();

      const bottomHeight =
        this.linesHeight(after) + promptHeight - 1 - cursorPos.rows;

      readline.moveCursor(output, 0, -bottomHeight);
      readline.cursorTo(output, cursorPos.cols);

      this.renderState = { before, prompt, after, promptHeight };
    }
  };

  readline.emitKeypressEvents(input);
  input.on("keypress", (input, key) => makitso.onKeyPress(input, key));

  rl.on("line", line => makitso.onSubmit(line));
  rl.on("close", () => makitso.onClose());
  rl.on("pause", () => makitso.onPause());
  rl.on("resume", () => makitso.onResume());

  process.stdout.on("resize", function() {
    makitso.updateTerminalSize();
    makitso.terminalSizeUpdated = true;
    makitso.render();
  });
  makitso.updateTerminalSize();

  return makitso;
}

const makitso = Makitso({ prompt: "makitso> " });

const overrides = {
  onKeyPress(input, key) {
    if (key.name === "enter" || key.name === "return") {
      return;
    }
    if (key.ctrl && key.name === "c") {
      this.close();
      return;
    }
    if (key.name === "tab") {
      this.deleteLeft(); // remove the tab
      this.insertString("HHHH");
    }
    this.render();
  },

  onSubmit(line) {
    debug({ line });
    const command = line.trim();

    this.clearScreenDown();

    if (/^help\b/.test(command)) {
      this.displayHelp(command.replace(/^help\s*/, ""));
    } else {
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
    }
    this.render();
  },

  displayHelp(command) {
    console.log(`Help for ${command || "everything"}\nhth\n`);
    this.setPrompt("help> ");
    this.render();
  },

  processCommand(command) {
    console.log(`I don't know how to ${command}.`);
  },

  onClose() {
    console.log("\nHave a great day!");
    process.exit(0);
  }
};

// Object.assign(makitso, overrides);

makitso.render();
