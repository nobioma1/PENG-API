const dotenv = require('dotenv');

const envFound = dotenv.config();

if (!envFound) {
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  SECRET: {
    JWT: process.env.SECRET || 'Here!, Look no farther 😈',
    CRYPT: process.env.CRYPT_SECRET || 'YouThinkThisIsAJoke🤐',
  },
  SENDGRID: {
    API_KEY: process.env.SENDGRID_API_KEY,
    EMAIL: process.env.EMAIL || 'donotreply@peng.com',
    APP_URL: process.env.APP_URL || 'http://localhost:3000',
  },
  LOGS: {
    LEVEL: process.env.LOG_LEVEL || 'silly',
  },
};
