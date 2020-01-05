const Joi = require('@hapi/joi');

exports.userUpdateSchema = Joi.object({
  name: Joi.string()
    .label('Name')
    .min(4)
    .required(),
  imageURL: Joi.string().label('Image URL'),
});
