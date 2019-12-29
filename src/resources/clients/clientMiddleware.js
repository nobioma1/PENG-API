const { Client } = require('../../models');

function clientExists(req, res, next) {
  Client.findOne({
    name: req.body.name,
    workspace: req.workspace._id,
  }).exec((err, client) => {
    if (!client) {
      return next();
    }
    return res.status(400).json({
      error: 'Client with Name already exists',
    });
  });
}

module.exports = {
  clientExists,
};
