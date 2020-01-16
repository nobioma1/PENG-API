/* eslint-disable func-names */
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
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
    imageURL: {
      type: String,
      trim: true,
    },
    designs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Design',
      },
    ],
    contacts: [
      {
        type: {
          type: String,
        },
        contact: {
          type: String,
        },
      },
    ],
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Client', clientSchema);
