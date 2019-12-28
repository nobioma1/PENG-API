const Joi = require('@hapi/joi');

const workspaceSchema = Joi.object({
  name: Joi.string()
    .label('Name')
    .min(4)
    .required(),
  imageURL: Joi.string().label('Image URL'),
});

const inviteSchema = Joi.object({
  email: Joi.string()
    .label('Email Address')
    .email()
    .required(),
});

module.exports = {
  workspaceSchema,
  inviteSchema,
};
