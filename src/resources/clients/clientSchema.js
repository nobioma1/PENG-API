const Joi = require('@hapi/joi');

const clientSchema = Joi.object({
  name: Joi.string()
    .label('Name')
    .min(4)
    .required(),
  address: Joi.string()
    .label('Address')
    .min(4),
  contacts: Joi.array().items(
    Joi.object({
      type: Joi.string(),
      contact: Joi.string(),
    }),
  ),
  imageURL: Joi.string().label('Image URL'),
});

module.exports = {
  clientSchema,
};
