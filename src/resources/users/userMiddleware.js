const { User } = require('../../models');

/**
 * Checks if there is a user with given 'email' or 'userID' exists
 * Adds the user object to the 'req' object if found.
 * @param {req.params.userID | body.email} req
 * @param {*} res
 * @param {*} next
 * @returns 'next()' or res(400) - { error: 'User does not exist' }
 */
async function userExists(req, res, next) {
  const user = await User.findOne({
    _id: req.params.userID || req.authUser.sub,
  }).populate('workspace');

  if (user) {
    req.user = user;
    return next();
  }
  return res.status(400).json({ error: 'User does not exist' });
}

module.exports = {
  userExists,
};
