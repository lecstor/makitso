const _get = require("lodash/get");
const _set = require("lodash/set");
const _unset = require("lodash/unset");

function MemoryStore(data = {}) {
  return {
    get: async function({ prop, variant = "default" }) {
      return _get(data, `${prop.name}.${variant}`);
    },
    set: async function({ prop, variant = "default", value }) {
      _set(data, `${prop.name}.${variant}`, value);
      return value;
    },
    delete: async function({ prop, variant = "default" }) {
      const value = await this.get({ prop, variant });
      _unset(data, `${prop.name}.${variant}`);
      return value;
    },
    read: function() {
      return JSON.parse(JSON.stringify(data));
    }
  };
}

module.exports = MemoryStore;
