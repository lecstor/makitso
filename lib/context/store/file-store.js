const fs = require("fs");
const { promisify } = require("util");
const MemoryStore = require("./memory-store");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

function readJsonFile(file) {
  return readFile(file).then(JSON.parse);
}

function writeJsonFile(file, content) {
  return writeFile(file, JSON.stringify(content), "utf8");
}

function FileStore({ file }) {
  return {
    /**
     * @param {string} prop - dotted property path
     * @returns {*} the value of the property
     */
    get: async function(...args) {
      const data = await readJsonFile(file);
      const memStore = MemoryStore(data);
      return memStore.get(...args);
    },

    /**
     * @param {string} prop - dotted property path
     * @param {*} value - the value to set on the property
     * @returns {*} the value of the property
     */
    set: async function(...args) {
      const data = await readJsonFile(file);
      const memStore = MemoryStore(data);
      const value = await memStore.set(...args);
      await writeJsonFile(file, memStore.read());
      return value;
    },

    /**
     * @param {string} prop - dotted property path
     * @returns {*} the previous value of the property
     */
    delete: async function(...args) {
      const data = await readJsonFile(file);
      const memStore = MemoryStore(data);
      const value = await memStore.delete(...args);
      await writeJsonFile(file, memStore.read());
      return value;
    },

    /**
     * Read file contents
     *
     * @returns {*} the value of the property
     */
    read: async function() {
      return readJsonFile(file);
    }
  };
}

module.exports = FileStore;
