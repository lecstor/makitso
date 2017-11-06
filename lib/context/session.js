const _get = require("lodash/get");
const _set = require("lodash/set");
const _unset = require("lodash/unset");

const session = {
  get: async function(prop) {
    return _get(this.data, prop);
  },
  set: async function(prop, value) {
    return _set(this.data, prop, value);
  },
  delete: async function(prop) {
    return _unset(this.data, prop);
  }
};

function Session(data = {}) {
  return Object.assign({}, { data }, session);
}

module.exports = Session;
