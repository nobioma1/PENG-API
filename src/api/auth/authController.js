const bcrypt = require('bcryptjs');

const { User } = require('../../models');
const { generateToken } = require('../../utils/authToken');

async function signUp(req, res) {
  const { body } = req;
  try {
    const user = await User.create(body);
    const token = generateToken(user.id, user.email);
    return res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error Creating User' });
  }
}

async function login(req, res) {
  const { user, body } = req;
  const passwordIsValid = bcrypt.compareSync(body.password, user.password);
  if (passwordIsValid) {
    const token = generateToken(user.id, user.email);
    return res.status(200).json({
      token,
      user,
    });
  }
  return res.status(400).json({ error: 'Invalid Email or Password' });
}

module.exports = {
  signUp,
  login,
};
