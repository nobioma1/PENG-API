const clientRoute = require('express').Router();

const validate = require('../middlewares/validate');
const { clientSchema } = require('../schema/clientSchema');
const ClientService = require('../../services/Client');
const clientDoesNotExists = require('../middlewares/clientDoesNotExists');

clientRoute.post(
  '/',
  validate(clientSchema),
  clientDoesNotExists,
  async function(req, res, next) {
    const { body, workspace } = req;
    try {
      const ClientServiceInstance = new ClientService();
      const client = await ClientServiceInstance.addClient(body, workspace);
      res.status(201).json({ client });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = clientRoute;
