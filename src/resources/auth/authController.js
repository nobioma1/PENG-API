const bcrypt = require('bcryptjs');
const Crypto = require('crypto');

const sendMail = require('../../utils/sendMail');
const { User, VerifyToken, PasswordReset } = require('../../models');
const { generateToken } = require('../../utils/authToken');
const { encrypt } = require('../../utils/encrypt-decrypt');

async function signUp(req, res) {
  const { body } = req;
  try {
    const user = await User.create(body);
    const token = generateToken({
      sub: user.id,
      email: user.email,
    });

    const vToken = Crypto.randomBytes(20).toString('hex');
    const verify = await VerifyToken.create({
      userId: user.id,
      token: vToken,
    });

    const confirmToken = encrypt(verify.token);
    await sendMail(user.email, 'Registration Success, Email Verification', {
      name: user.name,
      subject: 'Verify Email',
      intro:
        'Thank you for Creating an Account with us. To begin you experience, please confirm your email',
      buttonText: 'Verify Email',
      link: `/confirm/${confirmToken}`,
    });

    return res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error Creating User' });
  }
}

async function resendVerification(req, res) {
  const { user } = req;

  try {
    const vToken = Crypto.randomBytes(20).toString('hex');
    const verify = await VerifyToken.findOneAndUpdate(
      { userId: user.id },
      {
        userId: user.id,
        token: vToken,
      },
      { upsert: true },
    ).lean();

    const confirmToken = encrypt(verify.token);
    await sendMail(user.email, 'Verify your Email Address', {
      name: user.name,
      subject: 'Verify Email',
      intro:
        'Now you have taken the step, Let us complete the verification process 😊',
      buttonText: 'Verify Email',
      link: `/confirm/${confirmToken}`,
    });

    return res.status(200).json({
      message: `Verification token resent to ${user.email}`,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error Sending Verification Token' });
  }
}

async function login(req, res) {
  const { user, body } = req;
  try {
    const passwordIsValid = bcrypt.compareSync(body.password, user.password);
    if (passwordIsValid) {
      const token = generateToken({
        sub: user.id,
        email: user.email,
      });
      return res.status(200).json({
        token,
        user,
      });
    }
    return res.status(400).json({ error: 'Invalid Email or Password' });
  } catch (error) {
    return res.status(500).json({ error: 'Error Logging in User' });
  }
}

async function forgotPassword(req, res) {
  const { user } = req;
  try {
    const rToken = Crypto.randomBytes(20).toString('hex');
    const reset = await PasswordReset.findOneAndUpdate(
      { userId: user.id },
      {
        userId: user.id,
        token: rToken,
      },
      { upsert: true },
    ).lean();

    const resetToken = encrypt(reset.token);
    await sendMail(user.email, 'Reset your password', {
      name: user.name,
      subject: 'Forgot your Reset?',
      intro:
        'No worries. Let’s get you to your account settings so you can choose a new one.',
      buttonText: 'Reset My Password',
      link: `/reset/${resetToken}`,
    });

    return res
      .status(200)
      .json({ message: `Password reset email sent to '${user.email}' 📨.` });
  } catch (error) {
    return res.status(500).json({ error: 'Forgot Password Error' });
  }
}

async function resetPassword(req, res) {
  const { user, body } = req;
  try {
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync(body.newPassword, salt);
    await User.findByIdAndUpdate(
      user.id,
      { password },
      async (err, { _id: id }) => {
        if (err) {
          throw new Error();
        }
        await PasswordReset.findOneAndDelete({ userId: id });
      },
    );
    return res.status(200).json({ message: 'Password Updated' });
  } catch (error) {
    return res.status(500).json({ error: 'Error Updating Password' });
  }
}

async function confirmUser(req, res) {
  const { userId } = req.userConfirm;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true },
      async (err, { _id: id }) => {
        if (err) {
          throw new Error();
        }
        await VerifyToken.findOneAndDelete({ userId: id });
      },
    ).lean();
    return res
      .status(200)
      .json({ message: `User with email '${user.email} confirmed` });
  } catch (error) {
    return res.status(500).json({ error: 'Error Confirming User' });
  }
}

module.exports = {
  signUp,
  resendVerification,
  login,
  forgotPassword,
  resetPassword,
  confirmUser,
};
