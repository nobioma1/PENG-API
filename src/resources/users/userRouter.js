const userRouter = require('express').Router();

userRouter.get('/', (req, res) => res.send('<h1>My People</h1>'));

module.exports = userRouter;
