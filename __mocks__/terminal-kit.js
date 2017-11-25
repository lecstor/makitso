"use strict";

const terminalKit = jest.genMockFromModule("terminal-kit");

const terminal = jest.fn();
terminal.height = 40;
terminal.scrollUp = jest.fn(() => terminal);
terminal.moveTo = jest.fn(() => terminal);
terminal.down = jest.fn(() => terminal);
terminal.eraseLine = jest.fn(() => terminal);
terminal.gray = jest.fn(() => terminal);
terminal.green = jest.fn(() => terminal);
terminal.asyncCleanup = jest.fn(fn => fn());
terminalKit.terminal = terminal;

module.exports = terminalKit;
