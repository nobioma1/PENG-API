module.exports = {
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: process.env.PORT || 5000,
  SECRET: process.env.SECRET || 'Here!, Look no farther 😈',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  EMAIL: process.env.EMAIL || 'donotreply@peng.com',
  CRYPT_SECRET: process.env.CRYPT_SECRET || 'YouThinkThisIsAJoke🤐',
};
