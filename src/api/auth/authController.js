const bcrypt = require('bcryptjs');
const Crypto = require('crypto');

const { User } = require('../../models');
const { generateToken } = require('../../utils/authToken');

async function signUp(req, res) {
  const { body } = req;
  try {
    const user = await User.create(body);
    const token = generateToken({ id: user.id, email: user.email });
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
    const token = generateToken({
      id: user.id,
      email: user.email,
    });
    return res.status(200).json({
      token,
      user,
    });
  }
  return res.status(400).json({ error: 'Invalid Email or Password' });
}

async function forgotPassword(req, res) {
  const {
    user: { _id: id },
  } = req;
  const passwordResetToken = Crypto.randomBytes(20).toString('hex');

  const { email } = await User.findByIdAndUpdate(
    id,
    { passwordResetToken },
    { new: true },
  ).lean();

  const token = generateToken(
    {
      id,
      email,
      token: passwordResetToken,
    },
    '1d',
  );
  // Have send email function to send token
  console.log(token);
  return res
    .status(200)
    .json({ message: `Password reset email sent to '${email}' 📨.` });
}

async function resetPassword(req, res) {
  const {
    user: { _id: id },
    body,
  } = req;

  try {
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync(body.newPassword, salt);
    await User.findByIdAndUpdate(id, { password }, { new: true }).lean();
    return res.status(400).json({ error: 'Password Updated' });
  } catch (error) {
    return res.status(400).json({ error: 'Error Updating Password' });
  }
}

module.exports = {
  signUp,
  login,
  forgotPassword,
  resetPassword,
};
