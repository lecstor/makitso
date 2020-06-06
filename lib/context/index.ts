"use strict";

import AppError from "@lecstor/app-error";
import _get from "lodash/get";
import _isFunction from "lodash/isFunction";

import { Prompt } from "makitso-prompt";

import { Stores } from "../plugins/stores";

import { keyPressAutoComplete } from "./keypress-autocomplete";
import { Commands, ContextSchema } from "../types";

/**
 * @param {String} schemaPath - the dotted path to the property schema
 * @returns {Error} - PropertySchemaNotDefined
 */
function PropNotSetError(schemaPath: string) {
  return AppError("PropertySchemaNotDefined", {
    status: 400,
    message: `There is no schema defined for the property "${schemaPath}"`,
    meta: { propSchemaPath: schemaPath },
  });
}

/**
 * @param {String} propRef - the dotted path to the property
 * @returns {Error} - PropBadFormatError
 */
function PropBadFormatError(propRef: string) {
  return AppError("PropertyBadlyFormatted", {
    status: 400,
    message: `"Property ${propRef}" is invalid.
    A property reference is a dotted string with exactly two or three parts.`,
    meta: { propRef },
  });
}

/**
 * @param {String} storeRef - a store idetifier
 * @returns {Error} - StoreNotFoundError
 */
function StoreNotFoundError(storeRef: string) {
  return AppError("StoreNotFound", {
    status: 400,
    message: `The requested context store "${storeRef}" does not exist.`,
    meta: { storeRef },
  });
}

/**
 * @param {String} propRef - the dotted path to the property
 * @returns {Object} - property meta
 */
function splitProp(propRef: string) {
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
 * @typedef {Object} PropertyMeta
 * @property {String} store - a store identifier
 * @property {Object} prompt - a question definition
 * @property {String} prompt.type - question type
 * @property {String} prompt.name - question name
 * @property {String} prompt.message - the question
 * @property {String} schemaPath - dotted path to the property schema
 * @property {String} propertyPath - dotted path to the property in the store
 * @property {String} variant - the difference between the schemaPath and the propertyPath
 */

/**
 *
 * @param {Object} schema - context schema
 * @param {String} propRef - the dotted path to the property
 * @returns {PropertyMeta} property metadata
 */
function getPropMeta(schema: ContextSchema, propRef: string) {
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
 * @param {Object} arg0 -
 * @param {Object} arg0.commands - Commands definition.
 * @param {Object} arg0.schema - Context schema.
 * @param {Object} arg0.stores - Object of store objects.
 * @returns {Object} An instance of Context.
 */

type ContextArgs = {
  commands: Commands;
  prompt?: Prompt;
  schema: ContextSchema;
  stores: Stores;
};

export function Context(arg0: ContextArgs) {
  const { commands, schema, stores, prompt } = arg0;
  return {
    commands,
    schema,
    stores,
    prompt,

    /**
     * Get a context property
     *
     * @param {string} prop - The property to get.
     * @returns {Promise} - The value of the property
     */
    get: async function (prop: string) {
      const meta = getPropMeta(this.schema, prop);

      if (!meta.ask) {
        return this.stores[meta.store].get(meta);
      }
      const variant = (meta.variant !== "default" ? meta.variant : false) || "";
      const {
        default: mDefault,
        footer,
        header,
        maskInput = false,
        prompt: mPrompt,
        storedValueIs,
        suggest,
      } = meta.ask;

      const value = await this.stores[meta.store].get(meta);
      // use stored value without prompting
      if (value && storedValueIs === "response") {
        return value;
      }

      const prompt = this.prompt || new Prompt();
      if (suggest) {
        const suggestList = _isFunction(suggest)
          ? await suggest({ property: prop })
          : suggest;
        const complete = keyPressAutoComplete(suggestList);
        Object.assign(prompt, {
          keyPressers: [...prompt.keyPressers, complete],
        });
      }

      const thisPrompt = {
        header: header ? header.replace("{variant}", variant) : "",
        prompt: mPrompt ? mPrompt.replace("{variant}", variant) : "",
        footer: footer ? footer.replace("{variant}", variant) : "",
        default: value && storedValueIs === "default" ? value : mDefault,
        maskInput,
      };
      const answer = await prompt.start(thisPrompt);
      await this.set(prop, answer);
      return answer;
    },

    /**
     * Set a context property
     *
     * @param {string} prop - The property to set.
     * @param {*} value - The value of the property.
     * @returns {Promise} - The value of the property
     */
    set: async function (prop: string, value: unknown) {
      const meta = getPropMeta(this.schema, prop);
      if (!this.stores[meta.store]) {
        throw StoreNotFoundError(meta.store);
      }
      return this.stores[meta.store].set(meta, value);
    },

    /**
     * Delete a property from context
     *
     * @param {string} prop - The property to delete.
     * @param {string} [variant="default"] - The name of the variant of this property type.
     * @returns {Promise} - The value of the property
     */
    delete: async function (prop: string) {
      const meta = getPropMeta(this.schema, prop);
      return this.stores[meta.store].delete(meta);
    },

    /**
     * get a store object
     *
     * @param {String} store - a store identifier
     * @returns {Object} store
     */
    getStore: async function (store: string) {
      return this.stores[store];
    },

    /**
     * list available store identifiers
     *
     * @returns {String[]} store identifiers
     */
    listStores: async function () {
      return Object.keys(this.stores);
    },

    /**
     * get the schema
     * @returns {Object} a copy of the schema plain object
     */
    getSchema: function () {
      return JSON.parse(JSON.stringify(this.schema));
    },
  };
}
