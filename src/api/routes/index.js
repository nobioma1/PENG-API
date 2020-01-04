const routes = require('express').Router();

const auth = require('./auth');
const user = require('./user');
const workspace = require('./workspace');
const client = require('./client');
const design = require('./design');
const validateAuthToken = require('../middlewares/validateAuthToken');
const workspaceExists = require('../middlewares/workspaceExists');

routes.use('/auth', auth);
routes.use('/user', validateAuthToken, user);
routes.use('/workspace', validateAuthToken, workspace);
routes.use(
  '/workspace/:workspaceID/client',
  validateAuthToken,
  workspaceExists,
  client,
);
routes.use(
  '/workspace/:workspaceID/client/:clientID/design',
  validateAuthToken,
  workspaceExists,
  design,
);

module.exports = routes;
