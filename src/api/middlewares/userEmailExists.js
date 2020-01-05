const { User } = require('../../models');
const ErrorHandler = require('../../utils/ErrorHandler');

async function userEmailExists(req, res, next) {
  try {
    const user = await User.findOne({
      email: req.body.email,
    }).populate('workspace');

    if (user) {
      req.user = user.toJSON();
      return next();
    }
    throw new ErrorHandler('User with email does not exist');
  } catch (error) {
    return next(error);
  }
}

module.exports = userEmailExists;
