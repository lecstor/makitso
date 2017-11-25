"use strict";

const keytar = require("keytar");

/**
 * Given a list of strings, replace {variant} with the value of variant
 *
 * @param {String} variant - The name of the variant of the property.
 * @param {...String} values - store option values
 * @returns {Array} The service and account values.
 */
function replaceVariant(variant, ...values) {
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
function extractProp(prop) {
  const { service = prop.schemaPath, account = prop.variant } =
    prop.storeOptions || {};
  return replaceVariant(prop.variant, service, account);
}

function KeychainStore() {
  return {
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
    get: async function(prop) {
      const [service, account] = extractProp(prop);
      return keytar.getPassword(service, account);
    },

    /**
     * Set the value of a property in the store.
     *
     * @param {Object} prop - The property schema.
     * @param {String} prop.schemaPath - Dotted path to the property in the schema.
     * @param {String} prop.variant - The name of the variant of the property.
     * @param {Object} prop.storeOptions - Property options for the store.
     * @param {String} prop.storeOptions.service - The service name for the property.
     * @param {String} prop.storeOptions.account - The account name for the property.
     * @param {*} value - The value to set on the property.
     * @returns {Promise} the property value
     */
    set: async function(prop, value) {
      const [service, account] = extractProp(prop);
      await keytar.setPassword(service, account, value);
      return value;
    },

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
    delete: async function(prop) {
      const [service, account] = extractProp(prop);
      return keytar.deletePassword(service, account);
    }
  };
}

function plugin() {
  return {
    stores: {
      keychain: KeychainStore()
    }
  };
}

module.exports = KeychainStore;
KeychainStore.plugin = plugin;
