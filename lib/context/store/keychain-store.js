const keytar = require("keytar");

function KeychainStore() {
  return {
    get: function(service, account) {
      return keytar.getPassword(service, account);
    },
    set: function(service, account, password) {
      return keytar.setPassword(service, account, password);
    },
    delete: function(service, account) {
      return keytar.deletePassword(service, account);
    }
  };
}

module.exports = KeychainStore;
