const keytar = require("keytar");

/**
 * Given a list of strings, replace {variant} with the value of variant
 *
 * @param {String} variant - The name of the variant of the property.
 * @param {...String} values - store option values
 * @returns {Array} The service and account values.
 */
function setVariant(variant, ...values) {
  return values.map(value => value.replace("{variant}", variant));
}

/**
 * Extract store options from prop object.
 *
 * If store options are not provided then the prop name and variant are used as
 * the service and account values.
 *
 * @param {Object} prop - The property schema with name.
 * @param {Object} prop.storeOptions - Property options for the store.
 * @param {String} prop.storeOptions.service - The service name for the property.
 * @param {String} prop.storeOptions.account - The account name for the property.
 * @param {String} [variant=default] - The name of the variant of the property.
 * @returns {Array} The service and account values.
 */
function extractProp(prop) {
  // const [plugin, property, variant = "default"] = prop.path.split(".");
  // const schemaPath = [plugin, property].join(".");
  const { service = prop.schemaPath, account = prop.variant } =
    prop.storeOptions || {};
  return setVariant(prop.variant, service, account);
}

function KeychainStore() {
  return {
    /**
     * Get the value of a property from the store.
     *
     * @param {Object} prop - The property schema.
     * @param {String} prop.name - Dotted path to the property in the schema.
     * @param {Object} prop.storeOptions - Property options for the store.
     * @param {String} prop.storeOptions.service - The service name for the property.
     * @param {String} prop.storeOptions.account - The account name for the property.
     * @returns {*} the property value
     */
    get: async function(prop) {
      return keytar.getPassword(...extractProp(prop));
    },

    /**
     * Set the value of a property in the store.
     *
     * @param {Object} prop - The property schema.
     * @param {String} prop.name - Dotted path to the property in the schema.
     * @param {Object} prop.storeOptions - Property options for the store.
     * @param {String} prop.storeOptions.service - The service name for the property.
     * @param {String} prop.storeOptions.account - The account name for the property.
     * @param {*} value - The value to set on the property.
     * @returns {*} the property value
     */
    set: async function(prop, value) {
      await keytar.setPassword(...extractProp(prop), value);
      return value;
    },

    /**
     * Delete a property from the store.
     *
     * @param {Object} prop - The property schema.
     * @param {String} prop.name - Dotted path to the property in the schema.
     * @param {Object} prop.storeOptions - Property options for the store.
     * @param {String} prop.storeOptions.service - The service name for the property.
     * @param {String} prop.storeOptions.account - The account name for the property.
     * @returns {*} the property value
     */
    delete: async function(prop) {
      return keytar.deletePassword(...extractProp(prop));
    }
  };
}

module.exports = KeychainStore;
