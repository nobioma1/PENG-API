const sgMail = require('@sendgrid/mail');
const { SENDGRID_API_KEY, EMAIL } = require('../config');
const emailTemplate = require('./mail');

const sendMail = async (to, subject, emailBody) => {
  const msg = {
    to,
    from: EMAIL,
    subject: `PENG - ${subject}`,
    html: emailTemplate(emailBody),
  };

  try {
    sgMail.setApiKey(SENDGRID_API_KEY);
    return sgMail.send(msg);
  } catch (error) {
    // throw new Error(error.message);
    return false;
  }
};

module.exports = sendMail;
