const logger = require('../../utils/logger');

module.exports = schema => (req, res, next) => {
  try {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      throw new Error(error);
    }
    next();
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
