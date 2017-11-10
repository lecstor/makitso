const _get = require("lodash/get");
const { prompt } = require("inquirer");

function splitProp(prop) {
  const [plugin, property, variant = "default"] = prop.split(".");
  return {
    schemaPath: [plugin, property].join("."),
    propertyPath: [plugin, property, variant].join("."),
    variant
  };
}

function getPropMeta(schema, prop) {
  const propMeta = splitProp(prop);
  const propSchema = _get(schema, propMeta.schemaPath);
  return { ...propSchema, ...propMeta };
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
     * @returns {*} - The value of the property
     */
    get: async function(prop) {
      const meta = getPropMeta(schema, prop);
      let value = await stores[meta.store].get(meta);
      if (value && !meta.promptWithDefault) {
        return value;
      }
      if (meta.promptWithDefault) {
        value = await prompt({
          ...meta.prompt,
          default: value || meta.default
        });
      } else {
        value = await prompt(meta.prompt);
      }
      const answer = _get(value, meta.prompt.name);
      await this.set(prop, answer);
      return answer;
    },

    /**
     * Set a context property
     *
     * @param {string} prop - The property to get.
     * @param {*} value - The value of the property.
     * @returns {*} - The value of the property
     */
    set: async function(prop, value) {
      const meta = getPropMeta(schema, prop);
      return stores[meta.store].set(meta, value);
    },

    /**
     * Delete a property from context
     *
     * @param {string} prop - The property to delete.
     * @param {string} [variant=default] - The name of the variant of this property type.
     * @returns {*} - The value of the property
     */
    delete: async function(prop) {
      const meta = getPropMeta(schema, prop);
      return stores[meta.store].delete(meta);
    }
  };
}

module.exports = Context;
