const { PasswordReset } = require('../../models');
const { decrypt } = require('../../utils/encrypt-decrypt');
const ErrorHandler = require('../../utils/ErrorHandler');

async function validateResetToken(req, res, next) {
  try {
    const token = decrypt(req.params.token);
    const userReset = await PasswordReset.findOne({ token });
    if (userReset) {
      req.userReset = userReset;
      return next();
    }
    throw new ErrorHandler('Cannot Reset Password, Invalid or Expired Token');
  } catch (error) {
    let err = error;
    if (error.message === 'Invalid IV length') {
      err = new ErrorHandler('Invalid Reset Token');
    }
    return next(err);
  }
}

module.exports = validateResetToken;
