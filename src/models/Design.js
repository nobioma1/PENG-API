/* eslint-disable func-names */
const mongoose = require('mongoose');
const measurementSchema = require('./measurementSchema');

const designSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    designType: {
      type: String,
      enum: ['male', 'female', 'unisex'],
    },
    color: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    measurement: measurementSchema,
    notes: {
      type: String,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Design', designSchema);
