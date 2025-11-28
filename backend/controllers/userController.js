import User from '../models/User.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import { sanitizeUser } from '../utils/helpers.js';
import logger from '../utils/logger.js';

export const getProfile = async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  res.json({
    user: sanitizeUser(user),
  });
};

export const updateProfile = async (req, res) => {
  const { name, username, settings } = req.body;

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  if (username && username.toLowerCase() !== username) {
    const existingUser = await User.findOne({
      username: username.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Username already taken',
      });
    }
    user.username = username.toLowerCase();
  }

  if (name) user.name = name;
  if (settings) {
    user.settings = {
      ...user.settings,
      ...settings,
    };
  }

  user.updatedAt = new Date();
  await user.save();

  logger.info(`Profile update for user: ${user.email}`);

  res.json({
    message: 'Profile updated successfully',
    user: sanitizeUser(user),
  });
};

export const getStats = async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const totalWorkouts = user.workoutHistory.length;
  const streak = user.streakCount;
  const tasksCompleted = user.tasks.filter((task) => task.completed).length;
  const totalTasks = user.tasks.length;

  const nextChallenge = 'None';

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const workoutsThisWeek = user.workoutHistory.filter(
    (w) => new Date(w.date) > weekAgo
  ).length;

  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const workoutsThisMonth = user.workoutHistory.filter(
    (w) => new Date(w.date) > monthAgo
  ).length;

  res.json({
    totalWorkouts,
    streak,
    tasksCompleted,
    totalTasks,
    nextChallenge,
    workoutsThisWeek,
    workoutsThisMonth,
  });
};

export const getProgress = async (req, res) => {
  const user = await User.findById(req.userId).populate(
    'workoutHistory.exerciseId'
  );

  if (!user) {
    throw new NotFoundError('User');
  }

  const totalWorkouts = user.workoutHistory.length;
  const streak = user.streakCount;

  const achievements = [];
  if (totalWorkouts >= 1) achievements.push('🎉 First Workout');
  if (totalWorkouts >= 10) achievements.push('💪 10 Workouts');
  if (totalWorkouts >= 50) achievements.push('🏆 50 Workouts');
  if (totalWorkouts >= 100) achievements.push('⭐ 100 Workouts');
  if (streak >= 7) achievements.push('🔥 7 Day Streak');
  if (streak >= 30) achievements.push('🚀 30 Day Streak');

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentWorkouts = user.workoutHistory.filter(
    (w) => new Date(w.date) > thirtyDaysAgo
  );

  const workoutsByDate = {};
  recentWorkouts.forEach((workout) => {
    const date = new Date(workout.date).toISOString().split('T')[0];
    workoutsByDate[date] = (workoutsByDate[date] || 0) + 1;
  });

  const workoutFrequency = Object.entries(workoutsByDate).map(
    ([date, count]) => ({
      date,
      workouts: count,
    })
  );

  res.json({
    totalWorkouts,
    streak,
    achievements,
    workoutFrequency,
    recentWorkouts: recentWorkouts.slice(-10),
  });
};

export const deleteAccount = async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      message: 'Password is required to delete account',
    });
  }

  const user = await User.findById(req.userId).select('+passwordHash');

  if (!user) {
    throw new NotFoundError('User');
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json({
      message: 'Incorrect password',
    });
  }

  await User.findByIdAndDelete(req.userId);

  logger.info(`Account deleted for user: ${user.email}`);

  res.json({
    message: 'Account deleted successfully',
  });
};

export const getWorkoutSummary = async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const totalWorkouts = user.workoutHistory.length;
  const lastWorkout = user.lastWorkoutDate;
  const currentStreak = user.streakCount;

  const totalMinutes = user.workoutHistory.reduce(
    (sum, w) => sum + (w.duration || 0),
    0
  );

  const dayCount = {};
  user.workoutHistory.forEach((workout) => {
    const day = new Date(workout.date).getDay();
    dayCount[day] = (dayCount[day] || 0) + 1;
  });

  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  let favoriteDay = 'N/A';
  let maxCount = 0;

  Object.entries(dayCount).forEach(([day, count]) => {
    if (count > maxCount) {
      maxCount = count;
      favoriteDay = daysOfWeek[parseInt(day)];
    }
  });

  res.json({
    totalWorkouts,
    lastWorkout,
    currentStreak,
    totalMinutes,
    totalHours: Math.round(totalMinutes / 60),
    favoriteDay,
    averagePerWeek: totalWorkouts > 0 ? (totalWorkouts / 4).toFixed(1) : 0,
  });
};
