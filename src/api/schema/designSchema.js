const Joi = require('@hapi/joi');

exports.designSchema = Joi.object({
  client: Joi.string()
    .label('Client')
    .required(),
  name: Joi.string()
    .label('Name')
    .min(4)
    .required(),
  designType: Joi.string()
    .label('Design Type')
    .valid('male', 'female', 'unisex'),
  color: Joi.string()
    .label('Color')
    .required(),
  images: Joi.array()
    .label('Images')
    .items(Joi.string()),
  measurement: Joi.object({
    shoulder: Joi.number().label('Shoulder'),
    aroundArm: Joi.number().label('Around Arm'),
    sleeve: Joi.number().label('Sleeve'),
    cuff: Joi.number().label('Cuff'),
    neck: Joi.number().label('Neck'),
    topLength: Joi.number().label('Top Length'),
    seatWaist: Joi.number().label('Seat Waist'),
    thigh: Joi.number().label('Thigh'),
    trouserLength: Joi.number().label('Trouser Length'),
    bar: Joi.number().label('Bar'),
    chest: Joi.number().label('Chest'),
    burst: Joi.number().label('Burst'),
    dressLength: Joi.number().label('Dress Length'),
    shoulderToUnderBurst: Joi.number().label('Shoulder to under burst'),
    shoulderToWaist: Joi.number().label('Shoulder to waist'),
    waist: Joi.number().label('Waist'),
    hips: Joi.number().label('Hips'),
    skirtLength: Joi.number().label('Skirt Length'),
  }),
  notes: Joi.string().label('Notes'),
});
