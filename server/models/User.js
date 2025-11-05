const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Admin/Team Lead', 'Team Members', 'Mentor'],
    default: 'Team Members'
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  const user = this;
  // Only hash when password is modified and not already a bcrypt hash
  if (!user.isModified('password')) return next();
  // bcrypt hashes usually start with $2a$ or $2b$ or $2y$
  const isBcryptHash = typeof user.password === 'string' && /^\$2[aby]\$\d{2}\$/.test(user.password);
  if (isBcryptHash) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
