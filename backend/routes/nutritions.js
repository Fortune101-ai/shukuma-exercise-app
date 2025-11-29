import express from 'express';
import * as nutritionController from '../controllers/nutritionController.js';
import {
  validateObjectId,
  validatePagination,
  validateDateRange,
} from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.post(
  '/logs',
  [
    body('date')
      .notEmpty()
      .withMessage('Date is required')
      .isISO8601()
      .withMessage('Date must be in ISO 8601 format'),
    body('meals')
      .isArray({ min: 1 })
      .withMessage('At least one meal is required'),
    body('meals.*.name')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Meal name cannot exceed 100 characters'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters'),
    handleValidationErrors,
  ],
  asyncHandler(nutritionController.logFood)
);

router.get(
  '/logs',
  validatePagination,
  asyncHandler(nutritionController.getFoodLogs)
);

router.get('/guides', asyncHandler(nutritionController.getMealGuides));

router.get('/stats', asyncHandler(nutritionController.getNutritionStats));

router.get(
  '/logs/:logId',
  validateObjectId('logId'),
  asyncHandler(nutritionController.getFoodLogById)
);

router.put(
  '/logs/:logId',
  validateObjectId('logId'),
  [
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Date must be in ISO 8601 format'),
    body('meals')
      .optional()
      .isArray({ min: 1 })
      .withMessage('At least one meal is required'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters'),
    handleValidationErrors,
  ],
  asyncHandler(nutritionController.updateFoodLog)
);

router.delete(
  '/logs/:logId',
  validateObjectId('logId'),
  asyncHandler(nutritionController.deleteFoodLog)
);

export default router;
