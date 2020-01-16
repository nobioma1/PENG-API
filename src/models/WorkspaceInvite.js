/* eslint-disable func-names */
const mongoose = require('mongoose');

const workspaceInviteSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Workspace',
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('WorkspaceInvite', workspaceInviteSchema);
