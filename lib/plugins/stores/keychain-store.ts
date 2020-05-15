"use strict";

import keytar from "keytar";

import { Store } from "./types";

type PropertyMeta = {
  schemaPath: string;
  variant?: string;
  storeOptions: { service: string; account: string };
};

/**
 * Given a list of strings, replace {variant} with the value of variant
 *
 * @param {String} variant - The name of the variant of the property.
 * @param {...String} values - store option values
 * @returns {Array} The service and account values.
 */
function replaceVariant(variant: string, ...values: string[]) {
  return values.map(value => value.replace("{variant}", variant));
}

/**
 * Extract store options from prop object.
 *
 * If store options are not provided then the prop name and variant are used as
 * the service and account values.
 *
 * @param {Object} prop - The property schema with name.
 * @param {String} prop.schemaPath - Dotted path to the property in the schema.
 * @param {String} prop.variant - The name of the variant of the property.
 * @param {Object} prop.storeOptions - Property options for the store.
 * @param {String} prop.storeOptions.service - The service name for the property.
 * @param {String} prop.storeOptions.account - The account name for the property.
 * @returns {Array} The service and account values.
 */
function extractProp({ schemaPath, variant = "", storeOptions }: PropertyMeta) {
  const { service = schemaPath, account = variant } = storeOptions || {};
  return replaceVariant(variant, service, account);
}

export class KeychainStore implements Store {
  /**
   * Get the value of a property from the store.
   *
   * @param {Object} prop - The property schema.
   * @param {String} prop.schemaPath - Dotted path to the property in the schema.
   * @param {String} prop.variant - The name of the variant of the property.
   * @param {Object} prop.storeOptions - Property options for the store.
   * @param {String} prop.storeOptions.service - The service name for the property.
   * @param {String} prop.storeOptions.account - The account name for the property.
   * @returns {Promise} the property value
   */
  get({ schemaPath, variant, storeOptions }: PropertyMeta) {
    const [service, account] = extractProp({
      schemaPath,
      variant,
      storeOptions
    });
    return keytar.getPassword(service, account);
  }

  /**
   * Set the value of a property in the store.
   *
   * @param {Object} prop - The property schema.
   * @param {String} prop.schemaPath - Dotted path to the property in the schema.
   * @param {String} prop.variant - The name of the variant of the property.
   * @param {Object} prop.storeOptions - Property options for the store.
   * @param {String} prop.storeOptions.service - The service name for the property.
   * @param {String} prop.storeOptions.account - The account name for the property.
   * @param {String} value - The value to set on the property.
   * @returns {Promise} the property value
   */
  async set(prop: PropertyMeta, value: string) {
    const [service, account] = extractProp(prop);
    await keytar.setPassword(service, account, value);
    return value;
  }

  /**
   * Delete a property from the store.
   *
   * @param {Object} prop - The property schema.
   * @param {String} prop.schemaPath - Dotted path to the property in the schema.
   * @param {String} prop.variant - The name of the variant of the property.
   * @param {Object} prop.storeOptions - Property options for the store.
   * @param {String} prop.storeOptions.service - The service name for the property.
   * @param {String} prop.storeOptions.account - The account name for the property.
   * @returns {Promise} the property value
   */
  delete(prop: PropertyMeta) {
    const [service, account] = extractProp(prop);
    return keytar.deletePassword(service, account);
  }
}

export function plugin() {
  return {
    stores: {
      keychain: new KeychainStore()
    }
  };
}
