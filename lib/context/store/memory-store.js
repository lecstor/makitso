const _get = require("lodash/get");
const _set = require("lodash/set");
const _unset = require("lodash/unset");

function MemoryStore(data = {}) {
  return {
    /**
     * get a property from the store
     *
     * @param {Object} prop - property metadata
     * @param {String} prop.path - the path to the property
     * @returns {*} property value
     */
    get: async function(prop) {
      return _get(data, prop.propertyPath);
    },
    set: async function(prop, value) {
      _set(data, prop.propertyPath, value);
      return value;
    },
    delete: async function(prop) {
      const value = await this.get(prop);
      _unset(data, prop.propertyPath);
      return value;
    },
    read: function() {
      return JSON.parse(JSON.stringify(data));
    }
  };
}

module.exports = MemoryStore;
