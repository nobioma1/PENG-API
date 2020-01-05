const ErrorHandler = require('../../utils/ErrorHandler');

module.exports = schema => (req, res, next) => {
  try {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorArr = error.details.map(m =>
        m.message.replace(/[^a-zA-Z0-9 ]/g, ''),
      );
      throw new ErrorHandler(errorArr);
    }
    next();
  } catch (error) {
    next(error);
  }
};
