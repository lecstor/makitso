"use strict";

const keytar = jest.genMockFromModule("keytar");

let mockKeychain = Object.create(null);

function secretKey(service, account) {
  return `${service}-${account}`;
}

async function setPassword(service, account, password) {
  const key = secretKey(service, account);
  mockKeychain[key] = password;
}

async function getPassword(service, account) {
  const key = secretKey(service, account);
  if (!mockKeychain[key]) {
    return null;
  }
  return mockKeychain[key];
}

async function deletePassword(service, account) {
  const key = secretKey(service, account);
  if (!mockKeychain[key]) {
    return false;
  }
  delete mockKeychain[key];
  return true;
}

keytar.setPassword = setPassword;
keytar.getPassword = getPassword;
keytar.deletePassword = deletePassword;

module.exports = keytar;
