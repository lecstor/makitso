"use strict";

import fs from "fs";
import { promisify } from "util";
import { MemoryStore, PropertyMeta } from "./memory-store";
import { Store } from "./types";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export type FileStoreArgs = {
  path: string;
  data?: { [key: string]: unknown };
};

/**
 * read an object from a JSON file
 *
 * @param {String} file - the path to a JSON file
 * @returns {Object|void} the parsed JSON object or void if the file does not exist
 */
async function readJsonFile(file: string) {
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
 * write an object to a file as JSON
 *
 * @param {String} file - the path to a JSON file
 * @param {Object} content - plain Object
 * @returns {Promise} the result from writeFile
 */
function writeJsonFile(file: string, content: { [key: string]: unknown }) {
  return writeFile(file, JSON.stringify(content), "utf8");
}

/**
 * get a FileStore instance
 *
 * @param {Object} args -
 * @param {String} args.file - the path to a JSON file
 * @returns {Object} FileStore
 */
export class FileStore implements Store {
  filePath: string;
  initData: { [key: string]: unknown };

  constructor(args: FileStoreArgs) {
    const { path, data } = args;
    this.filePath = path;
    this.initData = data || {};
  }

  async load() {
    const data = await readJsonFile(this.filePath);
    if (!data) {
      await writeJsonFile(this.filePath, this.initData);
    }
    return this;
  }

  /**
   * get a property from the store
   *
   * @param {Object} prop - property metadata
   * @param {String} prop.propertyPath - the path to the property
   * @returns {Promise} property value
   */
  async get(prop: PropertyMeta) {
    const data = (await readJsonFile(this.filePath)) || {};
    const memStore = new MemoryStore({ data });
    return memStore.get(prop);
  }

  /**
   * set a property in the store
   *
   * @param {Object} prop - property metadata
   * @param {String} prop.propertyPath - the path to the property
   * @param {*} value - The value to set on the property.
   * @returns {Promise} property value
   */
  async set(prop: PropertyMeta, value: unknown) {
    const data = (await readJsonFile(this.filePath)) || {};
    const memStore = new MemoryStore({ data });
    const newValue = await memStore.set(prop, value);
    await writeJsonFile(this.filePath, memStore.read());
    return newValue;
  }

  /**
   * delete a property from the store
   *
   * @param {Object} prop - property metadata
   * @param {String} prop.propertyPath - the path to the property
   * @returns {Promise} previous property value
   */
  async delete(prop: PropertyMeta) {
    const data = await readJsonFile(this.filePath);
    if (!data) {
      // file does not exist
      return;
    }
    const memStore = new MemoryStore({ data });
    const value = await memStore.delete(prop);
    await writeJsonFile(this.filePath, memStore.read());
    return value;
  }

  /**
   * Read file contents
   *
   * @returns {Promise} the value of the property
   */
  async read() {
    return readJsonFile(this.filePath);
  }
}

export async function plugin(args: FileStoreArgs) {
  const store = await new FileStore(args).load();
  return {
    stores: {
      file: store
    }
  };
}
