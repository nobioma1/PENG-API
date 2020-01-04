const { User } = require('../../models');
const logger = require('../../utils/logger');

function emailDoesNotExists(req, res, next) {
  try {
    User.findOne({ email: req.body.email }, (err, user) => {
      if (user) {
        throw new Error('Email Address already exists');
      }
      return next();
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
}

module.exports = emailDoesNotExists;
