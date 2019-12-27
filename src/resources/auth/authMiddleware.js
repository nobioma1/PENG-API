const bcrypt = require('bcryptjs');

const { User, VerifyToken, PasswordReset } = require('../../models');
const { decrypt } = require('../../utils/encrypt-decrypt');
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

async function userEmailExists(req, res, next) {
  const user = await User.findOne({
    email: req.body.email,
  }).populate('workspace');

  if (user) {
    req.user = user;
    return next();
  }
  return res.status(400).json({ error: 'User with email does not exist' });
}

function signUpCheckPasswords(req, res, next) {
  const { body } = req;
  if (body.password === body.confirmPassword) {
    return next();
  }
  return res.status(400).json({ error: 'Passwords does not match' });
}

function validateResetToken(req, res, next) {
  try {
    const token = decrypt(req.params.token);
    PasswordReset.findOne({ token }, (err, userReset) => {
      if (userReset) {
        req.userReset = userReset;
        return next();
      }
      return res
        .status(400)
        .json({ error: 'Cannot Reset Password, Invalid or Expired Token' });
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid Token' });
  }
}

function resetCheckPassword(req, res, next) {
  const { body, userReset } = req;
  User.findById(userReset.userId, (err, user) => {
    if (user) {
      const passwordIsValid = bcrypt.compareSync(
        body.oldPassword,
        user.password,
      );
      if (passwordIsValid) {
        if (body.newPassword === body.confirmNewPassword) {
          req.user = user;
          return next();
        }
        return res.status(400).json({ error: 'Passwords does not match' });
      }
      return res.status(400).json({ error: 'Password does not match' });
    }
    return res
      .status(400)
      .json({ error: 'Cannot Reset Password, Invalid User' });
  });
}

function checkConfirmToken(req, res, next) {
  try {
    const token = decrypt(req.params.token);
    VerifyToken.findOne({ token }, (err, userConfirm) => {
      if (userConfirm) {
        req.userConfirm = userConfirm;
        return next();
      }
      return res
        .status(400)
        .json({ error: 'Cannot Confirm user, Invalid or Expired Token' });
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid Token' });
  }
}

async function userIsActive(req, res, next) {
  const { sub } = req.authUser;
  const user = await User.findById(sub).lean();
  if (!user.isActive) {
    req.user = user;
    return next();
  }
  return res.status(400).json({ error: 'User is already active' });
}

function validateAuthToken(req, res, next) {
  const token = req.headers.authorization;
  const decoded = verifyToken(token);
  if (decoded) {
    req.authUser = decoded;
    return next();
  }
  return res.status(401).json({ error: 'Provide a valid authorization token' });
}

module.exports = {
  emailDoesExists,
  userEmailExists,
  validateResetToken,
  signUpCheckPasswords,
  resetCheckPassword,
  checkConfirmToken,
  userIsActive,
  validateAuthToken,
};
