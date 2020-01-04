const { PasswordReset } = require('../../models');
const { decrypt } = require('../../utils/encrypt-decrypt');
const logger = require('../../utils/logger');

function validateResetToken(req, res, next) {
  try {
    const token = decrypt(req.params.token);
    PasswordReset.findOne({ token }, (err, userReset) => {
      if (userReset) {
        req.userReset = userReset;
        return next();
      }
      throw new Error('Cannot Reset Password, Invalid or Expired Token');
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
}

module.exports = validateResetToken;
