"use strict";

const AppError = require("@lecstor/app-error");
const _get = require("lodash/get");
const { prompt } = require("inquirer");

/**
 * @param {String} schemaPath - the dotted path to the property schema
 * @returns {Error} - PropertySchemaNotDefined
 */
function PropNotSetError(schemaPath) {
  return AppError("PropertySchemaNotDefined", {
    status: 400,
    message: `There is no schema defined for the property "${schemaPath}"`,
    meta: { propSchemaPath: schemaPath }
  });
}

/**
 * @param {String} propRef - the dotted path to the property
 * @returns {Error} - PropBadFormatError
 */
function PropBadFormatError(propRef) {
  return AppError("PropertyBadlyFormatted", {
    status: 400,
    message: `"Property ${propRef}" is invalid.
    A property reference is a dotted string with exactly two or three parts.`,
    meta: { propRef }
  });
}

/**
 * @param {String} storeRef - a store idetifier
 * @returns {Error} - StoreNotFoundError
 */
function StoreNotFoundError(storeRef) {
  return AppError("StoreNotFound", {
    status: 400,
    message: `The requested context store "${storeRef}" does not exist.`,
    meta: { storeRef }
  });
}

/**
 * @param {String} propRef - the dotted path to the property
 * @returns {Object} - property meta
 */
function splitProp(propRef) {
  const splitPropRef = propRef.split(".");
  if (splitPropRef.length < 2 || splitPropRef.length > 3) {
    throw PropBadFormatError(propRef);
  }
  const [plugin, property, variant = "default"] = splitPropRef;
  const schemaPath = [plugin, property].join(".");
  const propertyPath = [schemaPath, variant].join(".");
  return { schemaPath, propertyPath, variant };
}

/**
 *
 * @param {Object} schema - context schema
 * @param {String} propRef - the dotted path to the property
 * @returns {Object} property metadata
 */
function getPropMeta(schema, propRef) {
  const propMeta = splitProp(propRef);
  const propSchema = _get(schema, propMeta.schemaPath);
  if (!propSchema) {
    throw PropNotSetError(propMeta.schemaPath);
  }
  return { ...propSchema, ...propMeta };
}

/**
 * Get an instance of Context
 *
 * @param {Object} args - args
 * @param {Object} args.schema - The context schema.
 * @param {Object} args.stores - An object of store objects.
 * @returns {Object} An instance of Context.
 */
function Context(args) {
  const { schema, stores } = args;
  return {
    /**
     * Get a context property
     *
     * @param {string} prop - The property to get.
     * @returns {Promise} - The value of the property
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
     * @returns {Promise} - The value of the property
     */
    set: async function(prop, value) {
      const meta = getPropMeta(schema, prop);
      if (!stores[meta.store]) {
        throw StoreNotFoundError(meta.store);
      }
      return stores[meta.store].set(meta, value);
    },

    /**
     * Delete a property from context
     *
     * @param {string} prop - The property to delete.
     * @param {string} [variant="default"] - The name of the variant of this property type.
     * @returns {Promise} - The value of the property
     */
    delete: async function(prop) {
      const meta = getPropMeta(schema, prop);
      return stores[meta.store].delete(meta);
    },

    read: async store => {
      return stores[store].read();
    }
  };
}

module.exports = Context;
