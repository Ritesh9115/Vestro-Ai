const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    profilePicture: {
      type: String,
      default: null,
    },
    preferences: {
      experienceMode: {
        type: String,
        enum: ['beginner', 'intermediate', 'expert'],
        default: 'beginner',
      },
      defaultCurrency: {
        type: String,
        default: 'INR',
      },
    },
    // For JWT refresh token rotation — HashMap: O(1) lookup of valid refresh tokens
    refreshTokens: [
      {
        token: String,
        createdAt: { type: Date, default: Date.now },
        expiresAt: Date,
      },
    ],
    // For password reset
    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false },
    // Brute force protection
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index: resetToken for fast password reset lookup
userSchema.index({ resetToken: 1 });

// Hash password before saving
// Mongoose 9+: async middleware resolves via returned promise — do NOT call next()
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});


// Compare raw password with hash
userSchema.methods.comparePassword = async function (rawPassword) {
  return bcrypt.compare(rawPassword, this.passwordHash);
};

// Check if account is locked
userSchema.virtual('isLocked').get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

// Increment failed login attempts (brute force protection)
userSchema.methods.incLoginAttempts = async function () {
  // Reset if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  // Lock after 10 failed attempts for 1 hour
  if (this.loginAttempts + 1 >= 10 && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + 60 * 60 * 1000) };
  }
  return this.updateOne(updates);
};

module.exports = mongoose.model('User', userSchema);
