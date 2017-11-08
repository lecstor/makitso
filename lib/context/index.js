const _get = require("lodash/get");
const { prompt } = require("inquirer");

function formatStoreArgs(propSchema, prop, variant, value) {
  return { prop: { ...propSchema, name: prop }, variant, value };
}

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
     * @param {string} [variant=default] - The name of the variant of this property type.
     * @returns {*} - The value of the property
     */
    get: async function(prop, variant = "default") {
      const propSchema = _get(schema, prop);
      const storeArgs = formatStoreArgs(propSchema, prop, variant);

      let value = await stores[propSchema.store].get(storeArgs);
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
      await this.set(value, prop, variant);
      return value;
    },

    /**
     * Set a context property
     *
     * @param {*} value - The value of the property.
     * @param {string} prop - The property to get.
     * @param {string} [variant=default] - The name of the variant of this property type.
     * @returns {*} - The value of the property
     */
    set(value, prop, variant = "default") {
      const propSchema = _get(schema, prop);
      const storeArgs = formatStoreArgs(propSchema, prop, variant, value);
      return stores[propSchema.store].set(storeArgs);
    },

    /**
     * Delete a property from context
     *
     * @param {string} prop - The property to delete.
     * @param {string} [variant=default] - The name of the variant of this property type.
     * @returns {*} - The value of the property
     */
    delete(prop, variant = "default") {
      const propSchema = _get(schema, prop);
      const storeArgs = formatStoreArgs(propSchema, prop, variant);
      return stores[propSchema.store].delete(storeArgs);
    }
  };
}

module.exports = Context;
