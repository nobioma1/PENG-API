const authRoute = require('express').Router();

const validate = require('../middlewares/validate');
const authSchema = require('../schema/authSchema');
const AuthService = require('../../services/Auth');
const emailDoesNotExists = require('../middlewares/emailDoesNotExists');
const userEmailExists = require('../middlewares/userEmailExists');
const validateResetToken = require('../middlewares/validateResetToken');
const validateConfirmToken = require('../middlewares/validateConfirmToken');
const validateAuthToken = require('../middlewares/validateAuthToken');
const userNotActive = require('../middlewares/userNotActive');

authRoute.post(
  '/signup',
  validate(authSchema.signUpSchema),
  emailDoesNotExists,
  async function(req, res, next) {
    try {
      const AuthServiceInstance = new AuthService();
      const { token, user } = await AuthServiceInstance.signup(req.body);
      return res.status(201).json({
        token,
        user,
      });
    } catch (error) {
      return next(error);
    }
  },
);

authRoute.post(
  '/login',
  validate(authSchema.loginSchema),
  userEmailExists,
  async function(req, res, next) {
    try {
      const AuthServiceInstance = new AuthService();
      const { token, user } = await AuthServiceInstance.login(
        req.user,
        req.body,
      );
      return res.status(200).json({
        token,
        user,
      });
    } catch (error) {
      return next(error);
    }
  },
);

authRoute.post(
  '/forgot_password',
  validate(authSchema.forgotPwdSchema),
  userEmailExists,
  async function(req, res, next) {
    try {
      const AuthServiceInstance = new AuthService();
      const { user } = await AuthServiceInstance.forgotPassword(req.user);

      return res.status(200).json({
        message: `Password reset email sent to '${user.email}' 📨.`,
      });
    } catch (error) {
      return next(error);
    }
  },
);

authRoute.post(
  '/reset_password/:token',
  validate(authSchema.resetPwdSchema),
  validateResetToken,
  async function(req, res, next) {
    try {
      const AuthServiceInstance = new AuthService();
      await AuthServiceInstance.resetPassword(req.userReset, req.body);
      return res.status(200).json({ message: 'Password Updated' });
    } catch (error) {
      return next(error);
    }
  },
);

authRoute.get('/confirm_user/:token', validateConfirmToken, async function(
  req,
  res,
  next,
) {
  try {
    const AuthServiceInstance = new AuthService();
    const user = await AuthServiceInstance.confirmUser(req.userConfirm);

    return res
      .status(200)
      .json({ message: `User with email '${user.email} confirmed` });
  } catch (error) {
    return next(error);
  }
});

authRoute.get(
  '/resend_verify',
  validateAuthToken,
  userNotActive,
  async function(req, res, next) {
    try {
      const AuthServiceInstance = new AuthService();
      await AuthServiceInstance.reConfirm(req.user);
      return res
        .status(200)
        .json({ message: `Verification token resent to ${req.user.email}` });
    } catch (error) {
      return next(error);
    }
  },
);

module.exports = authRoute;
