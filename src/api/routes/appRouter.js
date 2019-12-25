const appRouter = require('express').Router();

const authRouter = require('../../resources/auth/authRouter');
const userRouter = require('../../resources/users/userRouter');

appRouter.use('/auth', authRouter);
appRouter.use('/users', userRouter);

module.exports = appRouter;
