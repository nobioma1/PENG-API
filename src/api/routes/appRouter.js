const appRouter = require('express').Router();

const { validateAuthToken } = require('../../resources/auth/authMiddleware');
const authRouter = require('../../resources/auth/authRouter');
const userRouter = require('../../resources/users/userRouter');
const clientRouter = require('../../resources/clients/clientRouter');
const workspaceRouter = require('../../resources/workspaces/workspaceRouter');
const {
  workspaceExists,
} = require('../../resources/workspaces/workspaceMiddleware');

appRouter.use('/auth', authRouter);
appRouter.use('/user', validateAuthToken, userRouter);
appRouter.use('/workspace', validateAuthToken, workspaceRouter);
appRouter.use(
  '/workspace/:workspaceID/client',
  validateAuthToken,
  workspaceExists,
  clientRouter,
);

module.exports = appRouter;
