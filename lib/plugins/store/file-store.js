"use strict";

const fs = require("fs");
const { promisify } = require("util");
const MemoryStore = require("./memory-store");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

/**
 *
 * @param {String} file - the path to a JSON file
 * @returns {Object|void} the parsed JSON object or void if the file does not exist
 */
async function readJsonFile(file) {
  try {
    const buffer = await readFile(file);
    return JSON.parse(buffer.toString());
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

/**
 *
 * @param {String} file - the path to a JSON file
 * @param {Object} content - plain Object
 * @returns {Promise} the result from writeFile
 */
function writeJsonFile(file, content) {
  return writeFile(file, JSON.stringify(content), "utf8");
}

/**
 *
 * @param {Object} args -
 * @param {String} args.file - the path to a JSON file
 * @returns {Object} FileStore
 */
async function FileStore(args) {
  const { path: filePath, data: initData } = args;

  const data = await readJsonFile(filePath);
  if (!data) {
    await writeJsonFile(filePath, initData);
  }

  return {
    /**
     * get a property from the store
     *
     * @param {Object} prop - property metadata
     * @param {String} prop.propertyPath - the path to the property
     * @returns {Promise} property value
     */
    get: async function(prop) {
      const data = (await readJsonFile(filePath)) || {};
      const memStore = MemoryStore({ data });
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
      const data = (await readJsonFile(filePath)) || {};
      const memStore = MemoryStore({ data });
      const newValue = await memStore.set(prop, value);
      await writeJsonFile(filePath, memStore.read());
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
      const data = await readJsonFile(filePath);
      if (!data) {
        // file does not exist
        return;
      }
      const memStore = MemoryStore({ data });
      const value = await memStore.delete(prop);
      await writeJsonFile(filePath, memStore.read());
      return value;
    },

    /**
     * Read file contents
     *
     * @returns {Promise} the value of the property
     */
    read: async function() {
      return readJsonFile(filePath);
    }
  };
}

async function plugin(args) {
  const store = await FileStore(args);
  return {
    stores: {
      file: store
    }
  };
}

module.exports = FileStore;
FileStore.plugin = plugin;
