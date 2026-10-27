import crypto from 'node:crypto';
import { User } from '../models/User.js';
import { PasswordResetToken } from '../models/PasswordResetToken.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { publicUser } from '../utils/serializers.js';
import { clearAuthCookie, setAuthCookie, signAuthToken } from '../utils/tokens.js';
import { isEmailConfigured, sendPasswordResetEmail } from '../services/emailService.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, college, department, year, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.', {
      code: 'EMAIL_TAKEN',
    });
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    name,
    email,
    passwordHash,
    college,
    department: department || '',
    year: year || '',
    role: 'student',
    status: 'active',
  });

  setAuthCookie(res, signAuthToken(user));

  return res.status(201).json({
    success: true,
    message: 'Your UniMarket account is ready.',
    data: { user: publicUser(user, { isSelf: true }) },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash +tokenVersion');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Email or password is incorrect.', {
      code: 'INVALID_CREDENTIALS',
    });
  }

  if (user.status === 'suspended') {
    throw new ApiError(403, 'This account is suspended. Contact the UniMarket team if you believe this is a mistake.', {
      code: 'ACCOUNT_SUSPENDED',
    });
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });
  setAuthCookie(res, signAuthToken(user));

  return res.json({
    success: true,
    message: 'Welcome back.',
    data: { user: publicUser(user, { isSelf: true }) },
  });
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  return res.json({ success: true, message: 'You have been signed out.' });
});

export const me = asyncHandler(async (req, res) => {
  return res.json({
    success: true,
    data: { user: publicUser(req.user, { isSelf: true }) },
  });
});

export const csrf = asyncHandler(async (req, res) => {
  return res.json({
    success: true,
    data: { csrfToken: req.csrfToken },
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  if (!isEmailConfigured()) {
    throw new ApiError(
      503,
      'Password-reset email is not configured on this server. Please contact the UniMarket team for help.',
      { code: 'EMAIL_NOT_CONFIGURED', expose: true }
    );
  }

  const user = await User.findOne({ email: req.body.email, status: 'active' });

  if (user) {
    await PasswordResetToken.deleteMany({ user: user._id });
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await PasswordResetToken.create({
      user: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    await sendPasswordResetEmail(user, rawToken);
  }

  return res.json({
    success: true,
    message: 'If an active account exists for that email, a reset link has been sent. It expires in 30 minutes.',
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const tokenHash = crypto.createHash('sha256').update(req.body.token).digest('hex');
  const reset = await PasswordResetToken.findOne({
    tokenHash,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!reset) {
    throw new ApiError(400, 'This reset link is invalid or has expired. Request a new one.', {
      code: 'RESET_TOKEN_INVALID',
    });
  }

  const user = await User.findById(reset.user).select('+tokenVersion');
  if (!user || user.status !== 'active') {
    throw new ApiError(400, 'This reset link can no longer be used.', {
      code: 'RESET_TOKEN_INVALID',
    });
  }

  user.passwordHash = await User.hashPassword(req.body.password);
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  reset.usedAt = new Date();
  await reset.save();
  await PasswordResetToken.deleteMany({ user: user._id });
  clearAuthCookie(res);

  return res.json({
    success: true,
    message: 'Your password has been updated. You can sign in now.',
  });
});
