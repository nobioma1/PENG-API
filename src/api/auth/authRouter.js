const authRouter = require('express').Router();

const authController = require('../auth/authController');
const authSchema = require('./authSchema');
const authMiddleware = require('./authMiddleware');
const validate = require('../../utils/validate');

authRouter.post(
  '/signup',
  validate(authSchema.signUpSchema),
  authMiddleware.emailDoesExists,
  authMiddleware.signUpCheckPasswords,
  authController.signUp,
);
authRouter.post(
  '/login',
  validate(authSchema.loginSchema),
  authMiddleware.userExists,
  authController.login,
);
authRouter.post(
  '/forgot-password',
  validate(authSchema.forgotPwdSchema),
  authMiddleware.userExists,
  authController.forgotPassword,
);
authRouter.post(
  '/reset-password',
  validate(authSchema.resetPwdSchema),
  authMiddleware.validateResetToken,
  authMiddleware.resetCheckPassword,
  authController.resetPassword,
);

module.exports = authRouter;
