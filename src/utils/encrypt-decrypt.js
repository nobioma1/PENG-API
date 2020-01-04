const Cryptr = require('cryptr');

const { SECRET } = require('../config');

const cryptr = new Cryptr(SECRET.CRYPT);

module.exports = {
  encrypt: payload => cryptr.encrypt(payload),
  decrypt: encryptedString => cryptr.decrypt(encryptedString),
};
