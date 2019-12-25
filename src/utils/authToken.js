const jwt = require('jsonwebtoken');

const { SECRET } = require('../config');

module.exports = {
  generateToken(payload, expiresIn = '2d') {
    const token = jwt.sign(payload, SECRET, { expiresIn });
    return token;
  },
  verifyToken: token => {
    try {
      const decoded = jwt.verify(token, SECRET);
      return decoded;
    } catch (err) {
      return false;
    }
  },
};
