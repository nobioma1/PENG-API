const { Client } = require('../../models');
const EventHandler = require('../../utils/ErrorHandler');

async function clientExists(req, res, next) {
  try {
    const { client } = req.body;
    const workspaceClient = await Client.findOne({
      _id: client,
      workspace: req.workspace._id,
    });

    if (workspaceClient) {
      req.workspaceClient = workspaceClient;
      return next();
    }
    throw new EventHandler('Client not in workspace', 404);
  } catch (error) {
    return next(error);
  }
}

module.exports = clientExists;
