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
  confirm_password: Joi.string()
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

module.exports = {
  signUpSchema,
  loginSchema,
};
