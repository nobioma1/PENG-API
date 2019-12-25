const Joi = require('@hapi/joi');

const signUpSchema = Joi.object({
  name: Joi.string()
    .label('Name')
    .min(4)
    .required(),
  email: Joi.string()
    .label('Email Address')
    .email()
    .required(),
  password: Joi.string()
    .label('Password')
    .pattern(/^[a-zA-Z0-9]{3,30}$/)
    .required(),
  confirmPassword: Joi.string()
    .label('Confirm Password')
    .pattern(/^[a-zA-Z0-9]{3,30}$/)
    .required(),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .label('Email Address')
    .email()
    .required(),
  password: Joi.string()
    .label('Password')
    .pattern(/^[a-zA-Z0-9]{3,30}$/)
    .required(),
});

const forgotPwdSchema = Joi.object({
  email: Joi.string()
    .label('Email Address')
    .email()
    .required(),
});

const resetPwdSchema = Joi.object({
  oldPassword: Joi.string()
    .label('Old Password')
    .pattern(/^[a-zA-Z0-9]{3,30}$/)
    .required(),
  newPassword: Joi.string()
    .label('New Password')
    .pattern(/^[a-zA-Z0-9]{3,30}$/)
    .required(),
  confirmNewPassword: Joi.string()
    .label('Confirm New Password')
    .pattern(/^[a-zA-Z0-9]{3,30}$/)
    .required(),
});

const confirmSchema = Joi.object({
  email: Joi.string()
    .label('Confirm token')
    .required(),
});

module.exports = {
  signUpSchema,
  loginSchema,
  forgotPwdSchema,
  resetPwdSchema,
  confirmSchema,
};
