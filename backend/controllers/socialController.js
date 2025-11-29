import User from '../models/User.js';
import { NotFoundError, ConflictError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

export const getFriends = async (req, res) => {
  const user = await User.findById(req.userId).populate(
    'friends',
    'name username email createdAt'
  );

  if (!user) {
    throw new NotFoundError('User');
  }

  res.json({
    friends: user.friends,
    count: user.friends.length,
  });
};

export const sendFriendRequest = async (req, res) => {
  const { friendId } = req.params;

  if (friendId === req.userId) {
    return res.status(400).json({
      message: 'You cannot send a friend request to yourself',
    });
  }

  const user = await User.findById(req.userId);
  const friend = await User.findById(friendId);

  if (!user) {
    throw new NotFoundError('User');
  }

  if (!friend) {
    throw new NotFoundError('Friend not found');
  }

  if (user.friends.includes(friendId)) {
    throw new ConflictError('You are already friends with this user');
  }

  if (friend.friendRequests.includes(req.userId)) {
    throw new ConflictError('Friend request already sent');
  }

  if (!friend.friendRequests.includes(req.userId)) {
    friend.friendRequests.push(req.userId);
    await friend.save();
  }

  logger.info(`Friend request sent from ${user.email} to ${friend.email}`);

  res.json({
    message: 'Friend request sent successfully',
  });
};

export const acceptFriendRequest = async (req, res) => {
  const { friendId } = req.params;

  const user = await User.findById(req.userId);
  const friend = await User.findById(friendId);

  if (!user) {
    throw new NotFoundError('User');
  }

  if (!friend) {
    throw new NotFoundError('Friend not found');
  }

  if (!user.friendRequests.includes(friendId)) {
    return res.status(400).json({
      message: 'No friend request from this user',
    });
  }

  if (!user.friends.includes(friendId)) {
    user.friends.push(friendId);
  }
  if (!friend.friends.includes(req.userId)) {
    friend.friends.push(req.userId);
  }

  user.friendRequests = user.friendRequests.filter(
    (id) => id.toString() !== friendId
  );

  await user.save();
  await friend.save();

  logger.info(`Friend request accepted: ${user.email} and ${friend.email}`);

  res.json({
    message: 'Friend request accepted',
  });
};

export const rejectFriendRequest = async (req, res) => {
  const { friendId } = req.params;

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  if (!user.friendRequests.includes(friendId)) {
    return res.status(400).json({
      message: 'No friend request from this user',
    });
  }

  user.friendRequests = user.friendRequests.filter(
    (id) => id.toString() !== friendId
  );
  await user.save();

  logger.info(`Friend request rejected by user ${user.email}`);

  res.json({
    message: 'Friend request rejected',
  });
};

export const removeFriend = async (req, res) => {
  const { friendId } = req.params;

  const user = await User.findById(req.userId);
  const friend = await User.findById(friendId);

  if (!user) {
    throw new NotFoundError('User');
  }

  if (!friend) {
    throw new NotFoundError('Friend not found');
  }

  if (!user.friends.includes(friendId)) {
    return res.status(400).json({
      message: 'This user is not in your friends list',
    });
  }

  user.friends = user.friends.filter((id) => id.toString() !== friendId);
  friend.friends = friend.friends.filter((id) => id.toString() !== req.userId);

  await user.save();
  await friend.save();

  logger.info(`Friend removed: ${user.email} removed ${friend.email}`);

  res.json({
    message: 'Friend removed successfully',
  });
};

export const getFriendRequests = async (req, res) => {
  const user = await User.findById(req.userId).populate(
    'friendRequests',
    'name username email createdAt'
  );

  if (!user) {
    throw new NotFoundError('User');
  }

  res.json({
    friendRequests: user.friendRequests,
    count: user.friendRequests.length,
  });
};

export const getActivityFeed = async (req, res) => {
  const { limit = 20 } = req.query;

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const friendsActivity = await User.find({ _id: { $in: user.friends } })
    .select('name username workoutHistory')
    .populate('workoutHistory.exerciseId', 'name category difficulty');

  const activities = [];

  friendsActivity.forEach((friend) => {
    friend.workoutHistory.slice(-10).forEach((workout) => {
      activities.push({
        user: {
          _id: friend._id,
          name: friend.name,
          username: friend.username,
        },
        workout: {
          exercise: workout.exerciseId,
          date: workout.date,
          completed: workout.completed,
          duration: workout.duration,
        },
      });
    });
  });

  activities.sort(
    (a, b) => new Date(b.workout.date) - new Date(a.workout.date)
  );

  const limitedActivities = activities.slice(0, parseInt(limit));

  res.json({
    activities: limitedActivities,
    count: limitedActivities.length,
  });
};

export const searchUsers = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      message: 'Search query must be at least 2 characters',
    });
  }

  const searchLower = q.toLowerCase();

  const users = await User.find({
    $or: [
      { name: { $regex: searchLower, $options: 'i' } },
      { username: { $regex: searchLower, $options: 'i' } },
    ],
    _id: { $ne: req.userId },
  })
    .select('name username email createdAt')
    .limit(20);

  res.json({
    query: q,
    users,
    count: users.length,
  });
};
