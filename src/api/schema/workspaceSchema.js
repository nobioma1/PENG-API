const Joi = require('@hapi/joi');

exports.workspaceSchema = Joi.object({
  name: Joi.string()
    .label('Name')
    .min(4)
    .required(),
  logoURL: Joi.string().label('Image URL'),
});

exports.inviteSchema = Joi.object({
  email: Joi.string()
    .label('Email Address')
    .email()
    .required(),
});
