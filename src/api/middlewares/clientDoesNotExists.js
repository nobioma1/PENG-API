const { Client } = require('../../models');
const ErrorHandler = require('../../utils/ErrorHandler');

async function clientDoesNotExists(req, res, next) {
  try {
    const client = await Client.findOne({
      name: req.body.name,
      workspace: req.workspace._id,
    });
    if (!client) {
      return next();
    }
    throw new ErrorHandler('Client with Name already exists');
  } catch (error) {
    return next(error);
  }
}

module.exports = clientDoesNotExists;
