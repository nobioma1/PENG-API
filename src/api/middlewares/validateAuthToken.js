const { verifyToken } = require('../../utils/authToken');
const logger = require('../../utils/logger');

function validateAuthToken(req, res, next) {
  try {
    const token = req.headers.authorization;
    const decoded = verifyToken(token);
    if (decoded) {
      req.authUser = decoded;
      return next();
    }

    throw new Error('Provide a valid authorization token');
  } catch (error) {
    logger.error(error);
    return next(error);
  }
}

module.exports = validateAuthToken;
