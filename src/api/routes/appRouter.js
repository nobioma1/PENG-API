const appRouter = require('express').Router();

const { validateAuthToken } = require('../../resources/auth/authMiddleware');
const authRouter = require('../../resources/auth/authRouter');
const userRouter = require('../../resources/users/userRouter');
const workspaceRouter = require('../../resources/workspaces/workspaceRouter');

appRouter.use('/auth', authRouter);
appRouter.use('/user', validateAuthToken, userRouter);
appRouter.use('/workspace', validateAuthToken, workspaceRouter);

module.exports = appRouter;
