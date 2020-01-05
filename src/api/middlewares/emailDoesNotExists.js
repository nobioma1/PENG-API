const { User } = require('../../models');
const ErrorHandler = require('../../utils/ErrorHandler');

async function emailDoesNotExists(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      throw new ErrorHandler('Email Address already exists');
    }
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = emailDoesNotExists;
