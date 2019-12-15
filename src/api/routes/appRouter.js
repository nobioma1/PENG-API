const appRouter = require('express').Router();

const authRouter = require('../auth/authRouter');
const userRouter = require('../users/userRouter');

appRouter.use('/auth', authRouter);
appRouter.use('/users', userRouter);

module.exports = appRouter;
