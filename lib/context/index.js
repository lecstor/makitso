const _get = require("lodash/get");
const { prompt } = require("inquirer");

const context = {
  /**
   * Get a context property
   *
   * @param {string} prop - The property to get.
   * @returns {*} - The value of the property
   */
  get: async function(prop) {
    const schema = _get(this.schema, prop);
    let value = await this.stores[schema.store].get(prop);
    if (value && !schema.promptWithDefault) {
      return value;
    }
    if (schema.promptWithDefault) {
      value = await prompt({
        ...schema.prompt,
        default: value || schema.default
      });
    } else {
      value = await prompt(schema.prompt);
    }
    await this.stores[schema.store].set(prop, value);
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
    const schema = _get(this.schema, prop);
    return this.stores[schema.store].set(prop, value);
  },

  /**
   * Delete a property from context
   *
   * @param {string} prop - The property to delete.
   * @returns {*} - The value of the property
   */
  delete(prop) {
    const schema = _get(this.schema, prop);
    return this.stores[schema.store].delete(prop);
  }
};

/**
 *
 * @param {Object} schema - The context schema.
 * @param {Object} stores - An object of store objects.
 * @returns {Object} An instance of Context.
 */
function Context({ schema, stores }) {
  return Object.assign({}, { schema, stores }, context);
}

module.exports = Context;
