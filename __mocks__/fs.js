"use strict";

const fs = jest.genMockFromModule("fs");

let mockFiles = Object.create(null);

function readFile(file, cb) {
  if (!mockFiles[file]) {
    cb(new Error(`ENOENT: no such file or directory, open '${file}'`));
  }
  cb(null, mockFiles[file]);
}

function writeFile(file, content, encoding, cb) {
  if (!cb) {
    cb = encoding;
  }
  mockFiles[file] = content;
  cb();
}

fs.readFile = readFile;
fs.writeFile = writeFile;

module.exports = fs;
