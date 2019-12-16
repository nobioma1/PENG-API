const jwt = require('jsonwebtoken');
const { secret } = require('../config');

module.exports = {
  generateToken(payload, expiresIn = '2d') {
    const token = jwt.sign(payload, secret, { expiresIn });
    return token;
  },
  verifyToken: token => jwt.verify(token, secret),
};
