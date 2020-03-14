"use strict";

import _get from "lodash/get";
import _set from "lodash/set";
import _unset from "lodash/unset";

import { Store } from "./types";

export type PropertyMeta = {
  propertyPath: string;
};

export type MemoryStoreArgs = { data: Data };

type Data = { [key: string]: unknown };

export class MemoryStore implements Store {
  data: Data;

  constructor(args?: MemoryStoreArgs) {
    this.data = args?.data || {};
  }
  /**
   * get a property from the store
   *
   * @param {Object} prop - property metadata
   * @param {String} prop.propertyPath - the path to the property
   * @returns {Promise} property value
   */
  async get(prop: PropertyMeta) {
    return _get(this.data, prop.propertyPath);
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
    _set(this.data, prop.propertyPath, value);
    return value;
  }

  /**
   * delete a property from the store
   *
   * @param {Object} prop - property metadata
   * @param {String} prop.propertyPath - the path to the property
   * @returns {Promise} previous property value
   */
  async delete(prop: PropertyMeta) {
    const value = await this.get(prop);
    _unset(this.data, prop.propertyPath);
    return value;
  }

  /**
   * read the store data
   *
   * @returns {Object} the store data
   */
  read() {
    return JSON.parse(JSON.stringify(this.data));
  }
}

export function plugin(args: MemoryStoreArgs) {
  return {
    stores: {
      session: new MemoryStore(args)
    }
  };
}
