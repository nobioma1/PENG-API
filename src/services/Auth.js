const Crypto = require('crypto');
const bcrypt = require('bcryptjs');

const logger = require('../utils/logger');
const { User, VerifyToken, PasswordReset } = require('../models');
const { generateToken } = require('../utils/authToken');
const MailerService = require('./Mailer');
const { encrypt } = require('../utils/encrypt-decrypt');

class AuthService {
  constructor() {
    this.userModel = User;
    this.verifyTokenModel = VerifyToken;
    this.passwordResetModel = PasswordReset;
    this.encrypt = encrypt;
    this.mailer = new MailerService();
    this.generateToken = generateToken;
    this.logger = logger;
  }

  async signup(userInput) {
    try {
      const userRecord = await this.userModel.create(userInput);
      const token = this.generateToken({
        sub: userRecord.id,
        email: userRecord.email,
      });

      if (!userRecord) {
        throw new Error('User cannot be created');
      }

      const vToken = Crypto.randomBytes(20).toString('hex');
      const verify = await this.verifyTokenModel.create({
        userId: userRecord._id,
        token: vToken,
      });

      const confirmToken = encrypt(verify.token);
      await this.mailer.sendSignupConfirmationEmail(userRecord, confirmToken);
      const user = userRecord.toJSON();

      return {
        token,
        user,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async login(authUser, credentials) {
    try {
      await this.userModel.findById(authUser._id, (err, userDoc) => {
        const passwordIsValid = bcrypt.compareSync(
          credentials.password,
          userDoc.password,
        );

        if (!passwordIsValid) {
          throw new Error('Invalid Email or Password');
        }
      });

      const token = generateToken({
        sub: authUser.id,
        email: authUser.email,
      });

      const user = authUser;
      return {
        token,
        user,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async forgotPassword(user) {
    try {
      const rToken = Crypto.randomBytes(20).toString('hex');
      const resetRecord = await this.passwordResetModel.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          token: rToken,
        },
        { upsert: true, new: true },
      );

      if (!resetRecord) {
        throw new Error('Operation cannot be completed');
      }

      const resetToken = encrypt(resetRecord.token);
      await this.mailer.sendForgotPasswordEmail(user, resetToken);

      return { reset: resetRecord.toObject(), user };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async resetPassword(userReset, credentials) {
    try {
      // Gets user with id in userReset doc
      await this.userModel
        .findById(userReset.userId)
        .exec(async (userErr, user) => {
          if (user) {
            // compare if current and old passwords match
            const passwordIsValid = bcrypt.compareSync(
              credentials.oldPassword,
              user.password,
            );
            if (passwordIsValid) {
              const salt = bcrypt.genSaltSync(10);
              const password = bcrypt.hashSync(credentials.newPassword, salt);
              // Updates Password
              await this.userModel.findByIdAndUpdate(
                user.id,
                { password },
                async (err, userDoc) => {
                  if (userDoc) {
                    // Delete the userReset doc
                    await this.passwordResetModel.findOneAndDelete({
                      userId: userDoc.id,
                    });
                  }
                },
              );
            } else {
              throw new Error('Passwords does not match');
            }
          } else {
            throw new Error('User does not match');
          }
        });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async confirmUser(userConfirm) {
    try {
      const userRecord = await this.userModel.findByIdAndUpdate(
        userConfirm.userId,
        { isActive: true },
        { new: true },
        async (err, userDoc) => {
          await this.verifyTokenModel.findOneAndDelete({
            userId: userDoc.id,
          });
        },
      );

      const user = userRecord.toJSON();

      return { ...user };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async reConfirm(user) {
    try {
      const vToken = Crypto.randomBytes(20).toString('hex');
      const verifyRecord = await this.verifyTokenModel
        .findOneAndUpdate(
          { userId: user._id },
          {
            userId: user._id,
            token: vToken,
          },
          { upsert: true, new: true },
        )
        .lean();
      await this.mailer.resendConfirmation(user, verifyRecord);

      return verifyRecord;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}

module.exports = AuthService;
