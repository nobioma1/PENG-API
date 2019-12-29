/* eslint-disable func-names */
const mongoose = require('mongoose');
const MeasurementSchema = require('./Measurement');

const DesignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    designType: {
      type: String,
      enum: ['MALE', 'FEMALE', 'UNISEX'],
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
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('design', DesignSchema);
