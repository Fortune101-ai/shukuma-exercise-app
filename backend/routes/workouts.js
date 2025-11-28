import express from 'express';
import * as workoutController from '../controllers/workoutController.js';
import { validateWorkoutLog } from '../middleware/validation.js';
import {
  validateObjectId,
  validatePagination,
  validateDateRange,
} from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.post(
  '/log',
  validateWorkoutLog,
  asyncHandler(workoutController.logWorkout)
);

router.get(
  '/history',
  validatePagination,
  asyncHandler(workoutController.getWorkoutHistory)
);

router.get('/stats', asyncHandler(workoutController.getWorkoutStats));

router.get(
  '/calendar',
  validateDateRange,
  asyncHandler(workoutController.getWorkoutCalendar)
);

router.delete(
  '/:workoutId',
  validateObjectId('workoutId'),
  asyncHandler(workoutController.deleteWorkout)
);

export default router;
