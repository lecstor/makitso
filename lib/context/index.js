const _get = require("lodash/get");
const { prompt } = require("inquirer");

/**
 *
 * @param {Object} schema - The context schema.
 * @param {Object} stores - An object of store objects.
 * @returns {Object} An instance of Context.
 */
function Context({ schema, stores }) {
  return {
    /**
     * Get a context property
     *
     * @param {string} prop - The property to get.
     * @returns {*} - The value of the property
     */
    get: async function(prop) {
      const propSchema = _get(schema, prop);
      let value = await stores[propSchema.store].get(prop);
      if (value && !propSchema.promptWithDefault) {
        return value;
      }
      if (propSchema.promptWithDefault) {
        value = await prompt({
          ...propSchema.prompt,
          default: value || propSchema.default
        });
      } else {
        value = await prompt(propSchema.prompt);
      }
      await stores[propSchema.store].set(prop, value);
      return value;
    },

    /**
     * Set a context property
     *
     * @param {string} prop - The property to get.
     * @param {*} value - The value of the property.
     * @returns {*} - The value of the property
     */
    set(prop, value) {
      const propSchema = _get(schema, prop);
      return stores[propSchema.store].set(prop, value);
    },

    /**
     * Delete a property from context
     *
     * @param {string} prop - The property to delete.
     * @returns {*} - The value of the property
     */
    delete(prop) {
      const propSchema = _get(schema, prop);
      return stores[propSchema.store].delete(prop);
    }
  };
}

module.exports = Context;
