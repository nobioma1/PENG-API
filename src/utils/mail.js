const MailGen = require('mailgen');
const { APP_URL } = require('../config');

const mailGenerator = new MailGen({
  theme: 'cerberus',
  product: {
    name: 'PENG',
    link: APP_URL,
    // logo: your app logo url
  },
});

module.exports = ({ name, intro, buttonText, link }) => {
  const email = {
    body: {
      name, // name of user
      intro, // email body message
      action: {
        instructions: `Please click the button below to ${buttonText.toLowerCase()}`,
        button: {
          color: '#33b5e5',
          text: buttonText, // button text
          link: `${APP_URL}${link}`, // button link
        },
      },
    },
  };

  return mailGenerator.generate(email);
};
