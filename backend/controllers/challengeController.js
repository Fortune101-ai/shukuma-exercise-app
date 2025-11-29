import Challenge from '../models/Challenge.js';
import User from '../models/User.js';
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from '../middleware/errorHandler.js';
import { parsePagination, getPaginationMeta } from '../utils/helpers.js';
import logger from '../utils/logger.js';

export const getAllChallenges = async (req, res) => {
  const { type, difficulty, category, status = 'active' } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const filter = { isActive: true };

  if (type) {
    filter.type = type;
  }

  if (difficulty) {
    filter.difficulty = difficulty;
  }

  if (category) {
    filter.category = category;
  }

  const now = new Date();
  if (status === 'active') {
    filter.startDate = { $lte: now };
    filter.endDate = { $gte: now };
  } else if (status === 'upcoming') {
    filter.startDate = { $gt: now };
  } else if (status === 'expired') {
    filter.endDate = { $lt: now };
  }

  const challenges = await Challenge.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('createdBy', 'name username');

  const total = await Challenge.countDocuments(filter);

  res.json({
    challenges,
    pagination: getPaginationMeta(page, limit, total),
  });
};

export const getChallengeById = async (req, res) => {
  const { id } = req.params;

  const challenge = await Challenge.findById(id)
    .populate('createdBy', 'name username')
    .populate('participants', 'name username');

  if (!challenge) {
    throw new NotFoundError('Challenge');
  }

  const isParticipating = req.userId
    ? challenge.participants.some((p) => p._id.toString() === req.userId)
    : false;

  let userProgress = null;
  if (isParticipating) {
    const progress = challenge.process.find(
      (p) => p.userId.toString() === req.userId
    );
    userProgress = progress ? progress.value : 0;
  }

  res.json({
    challenge,
    isParticipating,
    userProgress,
  });
};

export const createChallenge = async (req, res) => {
  const {
    type,
    title,
    description,
    rules,
    difficulty,
    goal,
    startDate,
    endDate,
    reward,
    badge,
    category,
    isPublic,
  } = req.body;

  if (new Date(endDate) <= new Date(startDate)) {
    return res.status(400).json({
      message: 'End date must be after start date',
    });
  }

  const challenge = new Challenge({
    type,
    title,
    description,
    rules,
    difficulty,
    goal,
    startDate,
    endDate,
    reward,
    badge,
    category,
    isPublic: isPublic !== undefined ? isPublic : true,
    createdBy: req.userId,
  });

  await challenge.save();

  logger.info(`Challenge created: "${title}" by user ${req.userId}`);

  res.status(201).json({
    message: 'Challenge created successfully',
    challenge,
  });
};

export const joinChallenge = async (req, res) => {
  const { id } = req.params;

  const challenge = await Challenge.findById(id);

  if (!challenge) {
    throw new NotFoundError('Challenge');
  }

  if (new Date() < new Date(challenge.startDate)) {
    return res.status(400).json({
      message: 'This challenge has not started yet',
    });
  }

  if (new Date() > new Date(challenge.endDate)) {
    return res.status(400).json({
      message: 'This challenge has already ended',
    });
  }

  if (challenge.participants.includes(req.userId)) {
    throw new ConflictError('You are already participating in this challenge');
  }

  await challenge.addParticipant(req.userId);

  logger.info(`User ${req.userId} joined challenge: ${challenge.title}`);

  res.json({
    message: 'Successfully joined challenge',
    challenge,
  });
};

export const leaveChallenge = async (req, res) => {
  const { id } = req.params;

  const challenge = await Challenge.findById(id);

  if (!challenge) {
    throw new NotFoundError('Challenge');
  }

  if (!challenge.participants.includes(req.userId)) {
    return res.status(400).json({
      message: 'You are not participating in this challenge',
    });
  }

  await challenge.removeParticipant(req.userId);

  logger.info(`User ${req.userId} left challenge: ${challenge.title}`);

  res.json({
    message: 'Successfully left challenge',
  });
};

export const updateChallengeProgress = async (req, res) => {
  const { id } = req.params;
  const { value } = req.body;

  if (value === undefined || value < 0) {
    return res.status(400).json({
      message: 'Progress value must be a non-negative number',
    });
  }

  const challenge = await Challenge.findById(id);

  if (!challenge) {
    throw new NotFoundError('Challenge');
  }

  if (!challenge.participants.includes(req.userId)) {
    return res.status(403).json({
      message: 'You must join the challenge before updating progress',
    });
  }

  const now = new Date();
  if (
    now < new Date(challenge.startDate) ||
    now > new Date(challenge.endDate)
  ) {
    return res.status(400).json({
      message: 'Challenge is not currently active',
    });
  }

  await challenge.updateProgress(req.userId, value);

  logger.info(
    `User ${req.userId} updated progress for challenge: ${challenge.title} to ${value}`
  );

  res.json({
    message: 'Progress updated successfully',
    progress: value,
  });
};

export const getMyJoinedChallenges = async (req, res) => {
  const { status = 'active' } = req.query;

  const now = new Date();
  const filter = {
    participants: req.userId,
    isActive: true,
  };

  if (status === 'active') {
    filter.startDate = { $lte: now };
    filter.endDate = { $gte: now };
  } else if (status === 'upcoming') {
    filter.startDate = { $gt: now };
  } else if (status === 'completed') {
    filter.endDate = { $lt: now };
  }

  const challenges = await Challenge.find(filter).sort({ endDate: 1 });

  const challengesWithProgress = challenges.map((challenge) => {
    const progress = challenge.progress.find(
      (p) => p.userId.toString() === req.userId
    );
    return {
      ...challenge.toObject(),
      userProgress: progress ? progress.value : 0,
      progressPercentage: progress
        ? Math.round((progress.value / challenge.goal) * 100)
        : 0,
    };
  });

  res.json({
    challenges: challengesWithProgress,
    count: challengesWithProgress.length,
  });
};

export const getChallengeLeaderboard = async (req, res) => {
  const { id } = req.params;
  const { limit = 10 } = req.query;

  const challenge = await Challenge.findById(id).populate(
    'progress.userId',
    'name username'
  );

  if (!challenge) {
    throw new NotFoundError('Challenge');
  }

  const leaderboard = await challenge.getLeaderboard();

  res.json({
    challengeTitle: challenge.title,
    goal: challenge.goal,
    leaderboard: leaderboard.slice(0, parseInt(limit)),
  });
};

export const getActiveChallenges = async (req, res) => {
  const challenges = await Challenge.getActive();

  res.json({
    challenges,
    count: challenges.length,
  });
};

export const getUpcomingChallenges = async (req, res) => {
  const challenges = await Challenge.getUpcoming();

  res.json({
    challenges,
    count: challenges.length,
  });
};

export const deleteChallenge = async (req, res) => {
  const { id } = req.params;

  const challenge = await Challenge.findById(id);

  if (!challenge) {
    throw new NotFoundError('Challenge');
  }

  if (challenge.createdBy && challenge.createdBy.toString() !== req.userId) {
    throw new ForbiddenError(
      'Only the challenge creator can delete this challenge'
    );
  }

  await Challenge.findByIdAndDelete(id);

  logger.info(`Challenge deleted: ${challenge.title} by user ${req.userId}`);

  res.json({
    message: 'Challenge deleted successfully',
  });
};

export const getChallengeStats = async (req, res) => {
  const totalChallenges = await Challenge.countDocuments({ isActive: true });

  const activeChallenges = await Challenge.countDocuments({
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });

  const upcomingChallenges = await Challenge.countDocuments({
    isActive: true,
    startDate: { $gt: new Date() },
  });

  let userParticipating = 0;
  let userCompleted = 0;

  if (req.userId) {
    const user = await User.findById(req.userId);
    if (user) {
      const userChallenges = await Challenge.find({
        participants: req.userId,
        isActive: true,
      });

      userParticipating = userChallenges.filter((c) => c.isOngoing).length;
      userCompleted = userChallenges.filter((c) => c.isExpired).length;
    }
  }

  res.json({
    totalChallenges,
    activeChallenges,
    upcomingChallenges,
    userParticipating,
    userCompleted,
  });
};
