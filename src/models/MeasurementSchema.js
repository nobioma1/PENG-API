/* eslint-disable func-names */
const mongoose = require('mongoose');

const MeasurementSchema = new mongoose.Schema(
  {
    shoulder: {
      type: Number,
    },
    aroundArm: {
      type: Number,
    },
    sleeve: {
      type: Number,
    },
    cuff: {
      type: Number,
    },
    Neck: {
      type: Number,
    },
    topLength: {
      type: Number,
    },
    seatWaist: {
      type: Number,
    },
    thighs: {
      type: Number,
    },
    trouserLength: {
      type: Number,
    },
    bar: {
      type: Number,
    },
    chest: {
      type: Number,
    },
    burst: {
      type: Number,
    },
    dressLength: {
      type: Number,
    },
    shoulderToUnderBust: {
      type: Number,
    },
    shoulderToWaist: {
      type: Number,
    },
    waist: {
      type: Number,
    },
    hips: {
      type: Number,
    },
    skirtLength: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = MeasurementSchema;
