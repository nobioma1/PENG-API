const Joi = require('@hapi/joi');

exports.signUpSchema = Joi.object({
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
  confirmPassword: Joi.any()
    .valid(Joi.ref('password'))
    .required(),
  imageURL: Joi.string().label('Image URL'),
});

exports.loginSchema = Joi.object({
  email: Joi.string()
    .label('Email Address')
    .email()
    .required(),
  password: Joi.string()
    .label('Password')
    .pattern(/^[a-zA-Z0-9]{3,30}$/)
    .required(),
});

exports.forgotPwdSchema = Joi.object({
  email: Joi.string()
    .label('Email Address')
    .email()
    .required(),
});

exports.resetPwdSchema = Joi.object({
  newPassword: Joi.string()
    .label('New Password')
    .pattern(/^[a-zA-Z0-9]{3,30}$/)
    .required(),
  confirmNewPassword: Joi.any()
    .valid(Joi.ref('newPassword'))
    .required(),
});
