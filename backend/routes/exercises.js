import express from 'express';
import * as exerciseController from '../controllers/exerciseController.js';
import {
  validateObjectId,
  validatePagination,
} from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get(
  '/',
  optionalAuth,
  validatePagination,
  asyncHandler(exerciseController.getExercises)
);

router.get(
  '/random',
  optionalAuth,
  asyncHandler(exerciseController.getRandomExercise)
);

router.get(
  '/search',
  optionalAuth,
  asyncHandler(exerciseController.searchExercises)
);

router.get(
  '/popular',
  optionalAuth,
  asyncHandler(exerciseController.getPopularExercises)
);

router.get(
  '/stats',
  optionalAuth,
  asyncHandler(exerciseController.getExerciseStats)
);

router.get(
  '/category/:category',
  optionalAuth,
  asyncHandler(exerciseController.getExercisesByCategory)
);

router.get(
  '/difficulty/:difficulty',
  optionalAuth,
  asyncHandler(exerciseController.getExercisesByDifficulty)
);

router.get(
  '/:id',
  optionalAuth,
  validateObjectId('id'),
  asyncHandler(exerciseController.getExerciseById)
);

export default router;
