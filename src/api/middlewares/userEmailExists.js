const { User } = require('../../models');
const logger = require('../../utils/logger');

async function userEmailExists(req, res, next) {
  try {
    const user = await User.findOne({
      email: req.body.email,
    }).populate('workspace');

    if (user) {
      req.user = user.toJSON();
      return next();
    }
    throw new Error('User with email does not exist');
  } catch (error) {
    logger.error(error);
    return next(error);
  }
}

module.exports = userEmailExists;
