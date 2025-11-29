import express from 'express';
import * as challengeController from '../controllers/challengeController.js';
import {
  validateObjectId,
  validatePagination,
} from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.get(
  '/',
  optionalAuth,
  validatePagination,
  asyncHandler(challengeController.getAllChallenges)
);

router.get(
  '/active',
  optionalAuth,
  asyncHandler(challengeController.getActiveChallenges)
);

router.get(
  '/upcoming',
  optionalAuth,
  asyncHandler(challengeController.getUpcomingChallenges)
);

router.get(
  '/stats',
  optionalAuth,
  asyncHandler(challengeController.getChallengeStats)
);

router.get(
  '/my-challenges',
  authMiddleware,
  asyncHandler(challengeController.getMyJoinedChallenges)
);

router.post(
  '/',
  authMiddleware,
  [
    body('type')
      .isIn([
        'daily',
        'weekly',
        'monthly',
        'streak',
        'most-cards',
        'time-based',
        'group',
        'custom',
      ])
      .withMessage('Invalid challenge type'),
    body('title')
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('Title must be between 5 and 100 characters'),
    body('description')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('goal')
      .isInt({ min: 1 })
      .withMessage('Goal must be a positive integer'),
    body('startDate')
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    body('endDate').isISO8601().withMessage('End date must be a valid date'),
    body('difficulty')
      .optional()
      .isIn(['easy', 'medium', 'hard'])
      .withMessage('Invalid difficulty level'),
    body('category')
      .optional()
      .isIn(['fitness', 'nutrition', 'mindfulness', 'social', 'general'])
      .withMessage('Invalid category'),
    handleValidationErrors,
  ],
  asyncHandler(challengeController.createChallenge)
);
router.get(
  '/:id',
  optionalAuth,
  validateObjectId('id'),
  asyncHandler(challengeController.getChallengeById)
);

router.post(
  '/:id/join',
  authMiddleware,
  validateObjectId('id'),
  asyncHandler(challengeController.joinChallenge)
);

router.post(
  '/:id/leave',
  authMiddleware,
  validateObjectId('id'),
  asyncHandler(challengeController.leaveChallenge)
);

router.put(
  '/:id/progress',
  authMiddleware,
  validateObjectId('id'),
  [
    body('value').isNumeric().withMessage('Progress value must be a number'),
    handleValidationErrors,
  ],
  asyncHandler(challengeController.updateChallengeProgress)
);

router.get(
  '/:id/leaderboard',
  optionalAuth,
  validateObjectId('id'),
  asyncHandler(challengeController.getChallengeLeaderboard)
);

router.delete(
  '/:id',
  authMiddleware,
  validateObjectId('id'),
  asyncHandler(challengeController.deleteChallenge)
);

export default router;
