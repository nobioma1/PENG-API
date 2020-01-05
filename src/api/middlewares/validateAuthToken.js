const { verifyToken } = require('../../utils/authToken');
const ErrorHandler = require('../../utils/ErrorHandler');

function validateAuthToken(req, res, next) {
  try {
    const token = req.headers.authorization;
    const decoded = verifyToken(token);
    if (decoded) {
      req.authUser = decoded;
      return next();
    }

    throw new ErrorHandler('Provide a valid authorization token', 401);
  } catch (error) {
    return next(error);
  }
}

module.exports = validateAuthToken;
