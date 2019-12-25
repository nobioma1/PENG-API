const Cryptr = require('cryptr');

const { CRYPT_SECRET } = require('../config');

const cryptr = new Cryptr(CRYPT_SECRET);

module.exports = {
  encrypt: payload => cryptr.encrypt(payload),
  decrypt: encryptedString => cryptr.decrypt(encryptedString),
};
