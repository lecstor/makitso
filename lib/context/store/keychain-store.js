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
function extractProp(prop, variant = "default") {
  const { service = prop.name, account = variant } = prop.storeOptions || {};
  return setVariant(variant, service, account);
}

function KeychainStore() {
  return {
    /**
     * Get the value of a property from the store.
     *
     * @param {Object} $0.prop - The property schema.
     * @param {String} $0.prop.name - Dotted path to the property in the schema.
     * @param {Object} $0.prop.storeOptions - Property options for the store.
     * @param {String} $0.prop.storeOptions.service - The service name for the property.
     * @param {String} $0.prop.storeOptions.account - The account name for the property.
     * @param {String} [$0.variant=default] - The name of the variant of the property.
     * @returns {*} the property value
     */
    get: function({ prop, variant }) {
      return keytar.getPassword(...extractProp(prop, variant));
    },

    /**
     * Set the value of a property in the store.
     *
     * @param {Object} $0.prop - The property schema.
     * @param {String} $0.prop.name - Dotted path to the property in the schema.
     * @param {Object} $0.prop.storeOptions - Property options for the store.
     * @param {String} $0.prop.storeOptions.service - The service name for the property.
     * @param {String} $0.prop.storeOptions.account - The account name for the property.
     * @param {String} [$0.variant=default] - The name of the variant of the property.
     * @param {*} $0.value - The value to set on the property.
     * @returns {*} the property value
     */
    set: function({ prop, variant, value }) {
      return keytar.setPassword(...extractProp(prop, variant), value);
    },

    /**
     * Delete a property from the store.
     *
     * @param {Object} $0.prop - The property schema.
     * @param {String} $0.prop.name - Dotted path to the property in the schema.
     * @param {Object} $0.prop.storeOptions - Property options for the store.
     * @param {String} $0.prop.storeOptions.service - The service name for the property.
     * @param {String} $0.prop.storeOptions.account - The account name for the property.
     * @param {String} [$0.variant=default] - The name of the variant of the property.
     * @returns {*} the property value
     */
    delete: function({ prop, variant }) {
      return keytar.deletePassword(...extractProp(prop, variant));
    }
  };
}

module.exports = KeychainStore;
