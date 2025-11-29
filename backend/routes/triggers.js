import express from 'express';
import * as triggerController from '../controllers/triggerController.js';
import {
  validateObjectId,
  validatePagination,
} from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.post(
  '/',
  [
    body('trigger')
      .trim()
      .notEmpty()
      .withMessage('Trigger is required')
      .isLength({ max: 200 })
      .withMessage('Trigger cannot exceed 200 characters'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters'),
    handleValidationErrors,
  ],
  asyncHandler(triggerController.logTrigger)
);

router.get(
  '/',
  validatePagination,
  asyncHandler(triggerController.getTriggers)
);

router.get('/stats', asyncHandler(triggerController.getTriggerStats));

router.get(
  '/:triggerId',
  validateObjectId('triggerId'),
  asyncHandler(triggerController.getTriggerById)
);

router.put(
  '/:triggerId',
  validateObjectId('triggerId'),
  [
    body('trigger')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Trigger cannot be empty'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters'),
    handleValidationErrors,
  ],
  asyncHandler(triggerController.updateTrigger)
);

router.delete(
  '/:triggerId',
  validateObjectId('triggerId'),
  asyncHandler(triggerController.deleteTrigger)
);

export default router;
