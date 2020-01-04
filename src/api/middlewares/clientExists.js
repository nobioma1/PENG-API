const { Client } = require('../../models');
const logger = require('../../utils/logger');

function clientExists(req, res, next) {
  try {
    Client.findOne({
      _id: req.params.clientID,
      workspace: req.workspace._id,
    }).exec((err, workspaceClient) => {
      if (workspaceClient) {
        req.workspaceClient = workspaceClient;
        return next();
      }
      throw new Error('Client not in workspace');
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
}

module.exports = clientExists;
