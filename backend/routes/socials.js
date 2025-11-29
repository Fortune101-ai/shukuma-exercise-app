import express from 'express';
import * as socialController from '../controllers/socialController.js';
import { validateObjectId } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.get('/friends', asyncHandler(socialController.getFriends));

router.get(
  '/friend-requests',
  asyncHandler(socialController.getFriendRequests)
);

router.get('/feed', asyncHandler(socialController.getActivityFeed));

router.get('/search', asyncHandler(socialController.searchUsers));

router.post(
  '/friend-request/:friendId',
  validateObjectId('friendId'),
  asyncHandler(socialController.sendFriendRequest)
);

router.post(
  '/accept-friend/:friendId',
  validateObjectId('friendId'),
  asyncHandler(socialController.acceptFriendRequest)
);

router.post(
  '/reject-friend/:friendId',
  validateObjectId('friendId'),
  asyncHandler(socialController.rejectFriendRequest)
);

router.delete(
  '/friends/:friendId',
  validateObjectId('friendId'),
  asyncHandler(socialController.removeFriend)
);

export default router;
