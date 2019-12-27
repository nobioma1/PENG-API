module.exports = schema => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: error.details.map(m => m.message.replace(/[^a-zA-Z0-9 ]/g, '')),
    });
  }
  return next();
};
