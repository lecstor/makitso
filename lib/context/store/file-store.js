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

// const _get = require("lodash/get");
const _set = require("lodash/set");
// const _unset = require("lodash/unset");

function FileStore({ file }) {
  return {
    /**
     * @param {string} prop - dotted property path
     * @returns {*} the value of the property
     */
    get: async function({ prop, variant = "default" }) {
      const data = await readJsonFile(file);
      const memStore = MemoryStore(data);
      return memStore.get({ prop, variant });
    },

    /**
     * @param {string} prop - dotted property path
     * @param {*} value - the value to set on the property
     * @returns {*} the value of the property
     */
    set: async function({ prop, variant = "default", value }) {
      const data = await readJsonFile(file);
      const memStore = MemoryStore(data);
      await memStore.set({ prop, variant, value });
      await writeJsonFile(file, memStore.read());
      return value;
    },

    /**
     * @param {string} prop - dotted property path
     * @returns {*} the previous value of the property
     */
    delete: async function({ prop, variant = "default" }) {
      const data = await readJsonFile(file);
      const memStore = MemoryStore(data);
      const value = await memStore.delete({ prop, variant });
      await writeJsonFile(file, memStore.read());
      return value;
    }
  };
}

module.exports = FileStore;
