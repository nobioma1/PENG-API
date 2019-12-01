/* eslint-disable no-console */
const mongoose = require('mongoose');

function connectDb() {
  return mongoose
    .connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('Database Connection Established');
      return true;
    })
    .catch(() => console.log('Error Establishing Database Connection'));
}

module.exports = { connectDb };
