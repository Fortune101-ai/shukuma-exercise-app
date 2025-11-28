import express from 'express';
import * as authController from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import {
  validateSignup,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
} from '../middleware/validation.js';
import {
  authLimiter,
  passwordResetLimiter,
} from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.post(
  '/signup',
  authLimiter,
  validateSignup,
  asyncHandler(authController.signup)
);

router.post(
  '/login',
  authLimiter,
  validateLogin,
  asyncHandler(authController.login)
);

router.post(
  '/verify-token',
  authMiddleware,
  asyncHandler(authController.verifyToken)
);

router.get('/me', authMiddleware, asyncHandler(authController.getCurrentUser));

router.post(
  '/forgot-password',
  passwordResetLimiter,
  validatePasswordResetRequest,
  asyncHandler(authController.forgotPassword)
);

router.post(
  '/reset-password',
  authLimiter,
  validatePasswordReset,
  asyncHandler(authController.resetPassword)
);

router.post(
  '/change-password',
  authMiddleware,
  asyncHandler(authController.changePassword)
);

router.post('/logout', authMiddleware, asyncHandler(authController.logout));

export default router;
