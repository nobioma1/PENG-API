const userRouter = require('express').Router();

const userController = require('./userController');
const userMiddleware = require('./userMiddleware');

userRouter.get('/', userMiddleware.userExists, userController.getProfile);

module.exports = userRouter;
