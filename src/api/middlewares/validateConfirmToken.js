const { VerifyToken } = require('../../models');
const { decrypt } = require('../../utils/encrypt-decrypt');
const ErrorHandler = require('../../utils/ErrorHandler');

async function validateConfirmToken(req, res, next) {
  try {
    const token = decrypt(req.params.token);
    const userConfirm = await VerifyToken.findOne({ token });
    if (userConfirm) {
      req.userConfirm = userConfirm;
      return next();
    }
    throw new ErrorHandler('Cannot Confirm user, Invalid or Expired Token');
  } catch (error) {
    let err = error;
    if (error.message === 'Invalid IV length') {
      err = new ErrorHandler('Invalid Confirm Token');
    }

    return next(err);
  }
}

module.exports = validateConfirmToken;
