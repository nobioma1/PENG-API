const { VerifyToken } = require('../../models');
const { decrypt } = require('../../utils/encrypt-decrypt');
const logger = require('../../utils/logger');

function validateConfirmToken(req, res, next) {
  try {
    const token = decrypt(req.params.token);
    VerifyToken.findOne({ token }, (err, userConfirm) => {
      if (userConfirm) {
        req.userConfirm = userConfirm;
        return next();
      }
      throw new Error('Cannot Confirm user, Invalid or Expired Token');
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
}

module.exports = validateConfirmToken;
