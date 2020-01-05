const { User } = require('../../models');
const ErrorHandler = require('../../utils/ErrorHandler');

async function userExists(req, res, next) {
  const parameter = req.params.userID || req.authUser.sub;

  try {
    const user = await User.findById(parameter).populate('workspace');

    if (user) {
      req.user = user.toJSON();
      return next();
    }
    throw new ErrorHandler('User does not exist', 404);
  } catch (error) {
    return next(error);
  }
}

module.exports = userExists;
