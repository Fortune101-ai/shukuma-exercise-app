import express from 'express';
import * as taskController from '../controllers/taskController.js';
import {
  validateTask,
  validateObjectId,
  validatePagination,
} from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.post('/', validateTask, asyncHandler(taskController.createTask));

router.get('/', validatePagination, asyncHandler(taskController.getTasks));

router.get('/stats', asyncHandler(taskController.getTaskStats));

router.get(
  '/:taskId',
  validateObjectId('taskId'),
  asyncHandler(taskController.getTaskById)
);

router.put(
  '/:taskId',
  validateObjectId('taskId'),
  [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('completed')
      .optional()
      .isBoolean()
      .withMessage('Completed must be a boolean'),
    handleValidationErrors,
  ],
  asyncHandler(taskController.updateTask)
);

router.patch(
  '/:taskId/toggle',
  validateObjectId('taskId'),
  asyncHandler(taskController.toggleTaskCompletion)
);

router.delete(
  '/:taskId',
  validateObjectId('taskId'),
  asyncHandler(taskController.deleteTask)
);

router.delete(
  '/completed/all',
  asyncHandler(taskController.deleteCompletedTasks)
);

router.patch('/complete/all', asyncHandler(taskController.completeAllTasks));

export default router;
