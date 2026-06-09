const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /.+\@.+\..+/
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['admin', 'owner', 'user'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  refreshToken: {
    type: String,
    default: null,
    select: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent modification of fields on update
userSchema.pre('findByIdAndUpdate', function(next) {
  if (this._update.password) {
    delete this._update.password;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
