const clientRouter = require('express').Router();
const validate = require('../../utils/validate');
const { clientSchema } = require('./clientSchema');
const clientMiddleware = require('./clientMiddleware');
const clientController = require('./clientController');

clientRouter.post(
  '/',
  validate(clientSchema),
  clientMiddleware.clientExists,
  clientController.addClient,
);

module.exports = clientRouter;
