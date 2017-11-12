const fs = require("fs");
const { promisify } = require("util");
const MemoryStore = require("./memory-store");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

function readJsonFile(file) {
  return readFile(file).then(buffer => JSON.parse(buffer.toString()));
}

function writeJsonFile(file, content) {
  return writeFile(file, JSON.stringify(content), "utf8");
}

function FileStore({ file }) {
  return {
    /**
     * get a property from the store
     *
     * @param {Object} prop - property metadata
     * @param {String} prop.propertyPath - the path to the property
     * @returns {Promise} property value
     */
    get: async function(prop) {
      const data = await readJsonFile(file);
      const memStore = MemoryStore(data);
      return memStore.get(prop);
    },

    /**
     * set a property in the store
     *
     * @param {Object} prop - property metadata
     * @param {String} prop.propertyPath - the path to the property
     * @param {*} value - The value to set on the property.
     * @returns {Promise} property value
     */
    set: async function(prop, value) {
      const data = await readJsonFile(file);
      const memStore = MemoryStore(data);
      const newValue = await memStore.set(prop, value);
      await writeJsonFile(file, memStore.read());
      return newValue;
    },

    /**
     * delete a property from the store
     *
     * @param {Object} prop - property metadata
     * @param {String} prop.propertyPath - the path to the property
     * @returns {Promise} previous property value
     */
    delete: async function(prop) {
      const data = await readJsonFile(file);
      const memStore = MemoryStore(data);
      const value = await memStore.delete(prop);
      await writeJsonFile(file, memStore.read());
      return value;
    },

    /**
     * Read file contents
     *
     * @returns {Promise} the value of the property
     */
    read: async function() {
      return readJsonFile(file);
    }
  };
}

module.exports = FileStore;
