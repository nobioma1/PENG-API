const { User } = require('../../models');
const logger = require('../../utils/logger');

async function userNotActive(req, res, next) {
  try {
    const { sub } = req.authUser;
    const user = await User.findById(sub);
    if (user.isActive) {
      throw new Error('User is already active');
    }
    req.user = user.toJSON();
    next();
  } catch (error) {
    logger.error(error);
    next(error);
  }
}

module.exports = userNotActive;
