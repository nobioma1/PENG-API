/* eslint-disable func-names */
const mongoose = require('mongoose');

const PasswordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expireAt: {
    type: Date,
    default: Date.now,
    index: { expires: '1440m' },
  },
});

module.exports = mongoose.model('passwordReset', PasswordResetSchema);
