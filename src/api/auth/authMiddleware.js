const { User } = require('../../models');

function emailDoesExists(req, res, next) {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (user) {
      return res
        .status(400)
        .json({ error: 'User with Email Address already exists' });
    }
    return next();
  });
}

function userExists(req, res, next) {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.status(400).json({ error: 'Invalid Email or Password' });
    }
    req.user = user;
    return next();
  });
}

module.exports = {
  emailDoesExists,
  userExists,
};
