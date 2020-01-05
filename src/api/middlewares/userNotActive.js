const { User } = require('../../models');
const ErrorHandler = require('../../utils/ErrorHandler');

async function userNotActive(req, res, next) {
  try {
    const { sub } = req.authUser;
    const user = await User.findById(sub);
    if (user.isActive) {
      throw new ErrorHandler('User is already active');
    }
    req.user = user.toJSON();
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = userNotActive;
