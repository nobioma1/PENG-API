const bcrypt = require('bcryptjs');

const { User } = require('../../models');
const { verifyToken } = require('../../utils/authToken');

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

function signUpCheckPasswords(req, res, next) {
  const { body } = req;
  if (body.password === body.confirmPassword) {
    return next();
  }
  return res.status(400).json({ error: 'Passwords does not match' });
}

function validateResetToken(req, res, next) {
  const { id, token } = verifyToken(req.body.token);
  User.findById(id, (err, user) => {
    if (user) {
      req.user = user;
      if (user.passwordResetToken === token) {
        return next();
      }
    }
    return res
      .status(400)
      .json({ error: 'Cannot Reset Password, Invalid Details' });
  });
}

function resetCheckPassword(req, res, next) {
  const { user, body } = req;

  const passwordIsValid = bcrypt.compareSync(body.oldPassword, user.password);
  if (passwordIsValid) {
    if (body.newPassword === body.confirmNewPassword) {
      return next();
    }
    return res.status(400).json({ error: 'Passwords does not match' });
  }
  return res.status(400).json({ error: 'Password does not match' });
}

module.exports = {
  emailDoesExists,
  userExists,
  validateResetToken,
  signUpCheckPasswords,
  resetCheckPassword,
};
