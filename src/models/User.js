/* eslint-disable func-names */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    workspaces: [mongoose.Schema.Types.ObjectId],
  },
  {
    timestamps: true,
  },
);

UserSchema.pre('save', function(next) {
  const salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(this.password, salt);
  next();
});

UserSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  return obj;
};

module.exports = mongoose.model('user', UserSchema);
