import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../middleware/errorHandler.js';
import { sanitizeUser } from '../utils/helpers.js';
import logger from '../utils/logger.js';

export const signup = async (req, res) => {
  const { email, password, name, username } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  if (username) {
    const existingUsername = await User.findOne({
      username: username.toLowerCase(),
    });
    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }
  }

  const user = new User({
    email: email.toLowerCase(),
    passwordHash: password,
    name,
    username: username ? username.toLowerCase() : undefined,
    verified: true,
  });

  await user.save();

  const token = generateToken(user._id, user.email);

  logger.info(`New user registered: ${user.email}`);

  res.status(201).json({
    message: 'Account created successfully',
    token,
    user: sanitizeUser(user),
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+passwordHash'
  );

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!user.verified) {
    throw new UnauthorizedError('Please verify your email before logging in');
  }

  const token = generateToken(user._id, user.email);

  user.lastLoginAt = new Date();
  await user.save();

  logger.info(`User logged in: ${user.email}`);

  res.json({
    message: 'Login successful',
    token,
    user: sanitizeUser(user),
  });
};

export const verifyToken = async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  res.json({
    message: 'Token is valid',
    user: sanitizeUser(user),
  });
};

export const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  res.json({
    user: sanitizeUser(user),
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.json({
      message:
        'If an account with that email exists, a password reset link has been sent.',
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetToken = resetToken;
  user.resetTokenExpiry = new Date(Date.now() + 3600000);
  await user.save();

  // TODO: Send email
  logger.info(`Password reset requested for: ${user.email}`);

  if (process.env.NODE_ENV === 'development') {
    return res.json({
      message: 'Password reset token generated',
      resetToken,
      resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
    });
  }

  res.json({
    message:
      'If an account with that email exists, a password reset link has been sent.',
  });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: new Date() },
  }).select('+resetToken +resetTokenExpiry');

  if (!user) {
    throw new UnauthorizedError('Invalid or expired reset token');
  }

  user.passwordHash = password;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  logger.info(`Password reset successful for: ${user.email}`);

  res.json({
    message:
      'Password reset successful. You can now login with your new password.',
  });
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: 'Current password and new password are required',
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      message: 'New password must be at least 8 characters long',
    });
  }

  const user = await User.findById(req.userId).select('+passwordHash');

  if (!user) {
    throw new NotFoundError('User');
  }

  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      message: 'New password must be different from current password',
    });
  }

  user.passwordHash = newPassword;
  await user.save();

  logger.info(`Password changed for: ${user.email}`);

  res.json({
    message: 'Password changed successfully',
  });
};

export const logout = async (req, res) => {
  logger.info(`User logged out: ${req.userEmail}`);

  res.json({
    message: 'Logged out successfully',
  });
};
