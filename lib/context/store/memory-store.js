const _get = require("lodash/get");
const _set = require("lodash/set");
const _unset = require("lodash/unset");

function MemoryStore(data = {}) {
  return {
    get: async function(prop) {
      return _get(data, prop);
    },
    set: async function(prop, value) {
      _set(data, prop, value);
      return value;
    },
    delete: async function(prop) {
      const value = _get(data, prop);
      _unset(data, prop);
      return value;
    }
  };
}

module.exports = MemoryStore;
