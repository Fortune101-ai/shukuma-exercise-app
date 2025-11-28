import express from 'express';
import * as journalController from '../controllers/journalController.js';
import {
  validateJournalEntry,
  validateObjectId,
  validatePagination,
  validateDateRange,
} from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.post(
  '/',
  validateJournalEntry,
  asyncHandler(journalController.createJournalEntry)
);

router.get(
  '/',
  validatePagination,
  asyncHandler(journalController.getJournalEntries)
);

router.get('/stats', asyncHandler(journalController.getJournalStats));

router.get('/mood-trends', asyncHandler(journalController.getMoodTrends));

router.get('/search', asyncHandler(journalController.searchJournalEntries));

router.get('/recent', asyncHandler(journalController.getRecentEntries));

router.get(
  '/:entryId',
  validateObjectId('entryId'),
  asyncHandler(journalController.getJournalEntryById)
);

router.put(
  '/:entryId',
  validateObjectId('entryId'),
  validateJournalEntry,
  asyncHandler(journalController.updateJournalEntry)
);

router.delete(
  '/:entryId',
  validateObjectId('entryId'),
  asyncHandler(journalController.deleteJournalEntry)
);

export default router;
