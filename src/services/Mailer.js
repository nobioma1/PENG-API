const sgMail = require('@sendgrid/mail');
const MailGen = require('mailgen');

const { SENDGRID } = require('../config');

class MailerService {
  constructor() {
    this.emailClient = sgMail.setApiKey(SENDGRID.API_KEY);
    this.mailGenerator = new MailGen({
      theme: 'cerberus',
      product: {
        name: 'PENG',
        link: SENDGRID.APP_URL,
        // logo: your app logo url
      },
    });
  }

  createEmail({ name, intro, buttonText, link }) {
    const email = {
      body: {
        name, // name of user
        intro, // email body message
        action: {
          instructions: `Please click the button below to ${buttonText.toLowerCase()}`,
          button: {
            color: '#33b5e5',
            text: buttonText, // button text
            link: `${SENDGRID.APP_URL}${link}`, // button link
          },
        },
      },
    };

    return this.mailGenerator.generate(email);
  }

  async sendSignupConfirmationEmail(user, confirmToken) {
    const msg = {
      from: SENDGRID.EMAIL,
      to: user.email,
      subject: `PENG - Registration Success, Email Verification`,
      html: this.createEmail({
        name: user.name,
        subject: 'Confirm Email Address for PENG account',
        intro:
          'Thank you for Creating an Account with us. To begin you experience, please confirm your email',
        buttonText: 'Confirm my Email',
        link: `/confirm/${confirmToken}`,
      }),
    };

    return sgMail.send(msg);
  }

  async sendForgotPasswordEmail(user, resetToken) {
    const msg = {
      from: SENDGRID.EMAIL,
      to: user.email,
      subject: `PENG - Forgot your Password?`,
      html: this.createEmail({
        name: user.name,
        subject: 'Forgot the Password to your PENG account?',
        intro:
          'No worries. Let’s get you to your account settings so you can choose a new one.',
        buttonText: 'Reset My Password',
        link: `/reset/${resetToken}`,
      }),
    };

    return sgMail.send(msg);
  }

  async resendConfirmation(user, verifyToken) {
    const msg = {
      from: SENDGRID.EMAIL,
      to: user.email,
      subject: `PENG - Verify your Email Address`,
      html: this.createEmail({
        name: user.name,
        subject: 'Verify Email Address to your PENG account?',
        intro:
          'Now you have taken the step, Let us complete the verification process 😊Now you have taken the step, Let us complete the verification process 😊',
        buttonText: 'Verify My Password',
        link: `/verify/${verifyToken}`,
      }),
    };

    return sgMail.send(msg);
  }

  async sendInvite(email, inviteToken, workspace) {
    const msg = {
      from: SENDGRID.EMAIL,
      to: email,
      subject: `PENG - Invitation to Join a Workspace`,
      html: this.createEmail({
        name: email,
        subject: `Invite to ${workspace.name}`,
        intro: `Hurray, 🎉🎉 You have been invited to join ${workspace.name} Workspace on PENG`,
        buttonText: `Join ${workspace.name}`,
        link: `/invite/${inviteToken}`,
      }),
    };

    return sgMail.send(msg);
  }
}

module.exports = MailerService;
