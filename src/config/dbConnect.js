const mongoose = require('mongoose');
const { DATABASE_URL } = require('../config');
const Logger = require('../utils/logger');

module.exports = async function() {
  const connection = await mongoose.connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true, // Remove useCreateIndex deprecation error
  });
  Logger.info('✌️ DB loaded and connected!');
  return connection.connection.db;
};
