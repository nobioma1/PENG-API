const jwt = require('jsonwebtoken');
const { secret } = require('../config');

module.exports = {
  generateToken(id, email) {
    const token = jwt.sign({ id, email }, secret, { expiresIn: '2d' });
    return token;
  },
  verifyToken: token => jwt.verify(token, secret),
};
