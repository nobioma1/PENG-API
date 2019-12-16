/* eslint-disable no-console */
const mongoose = require('mongoose');
const { databaseURL } = require('../config');

function connectDb() {
  return mongoose
    .connect(databaseURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true, // Remove useCreateIndex deprecation error
    })
    .then(() => {
      console.log('Database Connection Established');
      return true;
    })
    .catch(() => console.log('Error Establishing Database Connection'));
}

module.exports = { connectDb };
