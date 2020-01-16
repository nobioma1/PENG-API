/* eslint-disable func-names */
const mongoose = require('mongoose');

const verifySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

module.exports = mongoose.model('Verify', verifySchema);
