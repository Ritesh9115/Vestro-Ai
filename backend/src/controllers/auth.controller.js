const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const config = require('../config/config');
const { asyncHandler, createError } = require('../utils/errors');

// ─── JWT helpers ────────────────────────────────────────────────────────────

function generateAccessToken(userId) {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiry });
}

function generateRefreshToken(userId) {
  return jwt.sign({ userId }, config.jwtRefreshSecret, { expiresIn: config.refreshExpiry });
}

// ─── Email helper ────────────────────────────────────────────────────────────

async function sendResetEmail(toEmail, resetUrl) {
  if (!config.emailUser || !config.emailPass) {
    console.warn('Email not configured — password reset email skipped.');
    return;
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: config.emailUser, pass: config.emailPass },
  });
  await transporter.sendMail({
    from: config.emailFrom,
    to: toEmail,
    subject: 'Vestro AI — Reset Your Password',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#0F211A">Reset your password</h2>
        <p style="color:#5B6B63">Click the link below to reset your password. It expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#0E8F5B;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Reset Password
        </a>
        <p style="color:#9AA69F;font-size:12px;margin-top:24px">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/signup
 */
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw createError('An account with this email already exists.', 409);

  const user = new User({ name, email, passwordHash: password });
  await user.save();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  user.refreshTokens.push({ token: refreshToken, expiresAt });
  await user.save();

  res.status(201).json({
    message: 'Account created successfully.',
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, preferences: user.preferences },
  });
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash +loginAttempts +lockUntil');
  if (!user) throw createError('Invalid email or password.', 401);

  if (user.isLocked) {
    throw createError('Account temporarily locked due to too many failed attempts. Try again in 1 hour.', 423);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.incLoginAttempts();
    throw createError('Invalid email or password.', 401);
  }

  // Reset login attempts on success
  if (user.loginAttempts > 0) {
    await user.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } });
  }

  // Rotate refresh tokens — remove expired ones (HashMap: filter in O(n))
  user.refreshTokens = user.refreshTokens.filter((rt) => rt.expiresAt > new Date());

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  user.refreshTokens.push({ token: refreshToken, expiresAt });
  await user.save();

  res.json({
    message: 'Login successful.',
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, preferences: user.preferences },
  });
});

/**
 * POST /api/auth/logout
 * Does NOT require an access token — refreshToken is the credential
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, config.jwtRefreshSecret);
      await User.findByIdAndUpdate(payload.userId, {
        $pull: { refreshTokens: { token: refreshToken } },
      });
    } catch { /* expired / invalid token is fine — still log out */ }
  }
  res.json({ message: 'Logged out successfully.' });
});


/**
 * POST /api/auth/refresh
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) throw createError('Refresh token required.', 401);

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwtRefreshSecret);
  } catch {
    throw createError('Invalid or expired refresh token.', 401);
  }

  const user = await User.findById(decoded.userId).select('+refreshTokens');
  if (!user) throw createError('User not found.', 401);

  // DSA: HashMap — O(1) lookup of token in stored tokens array
  const storedToken = user.refreshTokens.find((rt) => rt.token === token && rt.expiresAt > new Date());
  if (!storedToken) throw createError('Refresh token revoked or expired.', 401);

  // Token rotation: remove old, issue new
  user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== token);
  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  user.refreshTokens.push({ token: newRefreshToken, expiresAt });
  await user.save();

  res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
});

/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always respond 200 to prevent email enumeration
  if (!user) {
    return res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetToken = hash;
  user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;
  try {
    await sendResetEmail(user.email, resetUrl);
  } catch (err) {
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    throw createError('Failed to send reset email. Please try again.', 500);
  }

  res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
});

/**
 * POST /api/auth/reset-password/:token
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetToken: hash,
    resetTokenExpiry: { $gt: new Date() },
  }).select('+resetToken +resetTokenExpiry');

  if (!user) throw createError('Reset link is invalid or has expired.', 400);

  user.passwordHash = password;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  user.refreshTokens = []; // Invalidate all sessions
  await user.save();

  res.json({ message: 'Password reset successfully. Please login.' });
});

/**
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      profilePicture: req.user.profilePicture,
      preferences: req.user.preferences,
      createdAt: req.user.createdAt,
    },
  });
});

module.exports = { signup, login, logout, refreshToken, forgotPassword, resetPassword, getMe };
