/* eslint-disable func-names */
const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    designs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'design',
      },
    ],
    contacts: [
      {
        type: Object,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('client', ClientSchema);
