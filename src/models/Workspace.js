/* eslint-disable func-names */
const mongoose = require('mongoose');

const WorkspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logoURL: {
      type: String,
      trim: true,
    },
    members: [mongoose.Schema.Types.ObjectId],
    owner: mongoose.Schema.Types.ObjectId,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('workspace', WorkspaceSchema);
