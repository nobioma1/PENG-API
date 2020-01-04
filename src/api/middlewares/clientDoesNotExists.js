const { Client } = require('../../models');
const logger = require('../../utils/logger');

function emailDoesNotExists(req, res, next) {
  try {
    Client.findOne({
      name: req.body.name,
      workspace: req.workspace._id,
    }).exec((err, client) => {
      if (!client) {
        return next();
      }
      throw new Error('Client with Name already exists');
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
}

module.exports = emailDoesNotExists;
