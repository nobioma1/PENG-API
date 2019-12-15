const authRouter = require('express').Router();

const { signUp, login } = require('../auth/authController');
const validate = require('../../utils/validate');
const { signUpSchema, loginSchema } = require('./authSchema');
const { emailDoesExists, userExists } = require('./authMiddleware');

authRouter.post('/signup', validate(signUpSchema), emailDoesExists, signUp);
authRouter.post('/login', validate(loginSchema), userExists, login);

module.exports = authRouter;
