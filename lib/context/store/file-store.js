const fs = require("fs");
const { promisify } = require("util");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

function readJsonFile(file) {
  return readFile(file).then(JSON.parse);
}

function writeJsonFile(file, content) {
  return writeFile(file, JSON.stringify(content), "utf8");
}

const _get = require("lodash/get");
const _set = require("lodash/set");
const _unset = require("lodash/unset");

function FileStore({ file }) {
  return {
    get: async function(prop) {
      const data = await readJsonFile(file);
      return _get(data, prop);
    },
    set: async function(prop, value) {
      const data = await readJsonFile(file);
      _set(data, prop, value);
      await writeJsonFile(file, data);
      return value;
    },
    delete: async function(prop) {
      const data = await readJsonFile(file);
      const value = _get(data, prop);
      _unset(data, prop);
      await writeJsonFile(file, data);
      return value;
    }
  };
}

module.exports = FileStore;
