/* eslint-disable func-names */
const mongoose = require('mongoose');
const MeasurementSchema = require('./MeasurementSchema');

const DesignSchema = new mongoose.Schema(
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
      ref: 'client',
    },
    measurement: MeasurementSchema,
    notes: {
      type: String,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'workspace',
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('design', DesignSchema);
