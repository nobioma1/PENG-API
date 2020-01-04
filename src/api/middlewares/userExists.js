const { User } = require('../../models');
const logger = require('../../utils/logger');

async function userEmailExists(req, res, next) {
  try {
    const user = await User.findOne({
      _id: req.params.userID || req.authUser.sub,
    }).populate('workspace');

    if (user) {
      req.user = user;
      return next();
    }
    throw new Error('User does not exist');
  } catch (error) {
    logger.error(error);
    return next(error);
  }
}

module.exports = userEmailExists;
