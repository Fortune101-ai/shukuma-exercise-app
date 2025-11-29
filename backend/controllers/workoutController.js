import User from '../models/User.js';
import ExerciseCard from '../models/ExerciseCard.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

export const logWorkout = async (req, res) => {
  const { exerciseId, duration, notes } = req.body;

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const exercise = await ExerciseCard.findById(exerciseId);

  if (!exercise) {
    throw new NotFoundError('Exercise');
  }

  const workedOutToday = user.workedOutToday();

  if (!workedOutToday) {
    user.updateStreak();
    user.lastWorkoutDate = new Date();
  }

  user.workoutHistory.push({
    exerciseId,
    date: new Date(),
    completed: true,
    duration: duration || exercise.duration,
    notes,
  });

  await user.save();

  await exercise.incrementCompletion();

  logger.info(`Workout logged: ${exercise.name} by user ${user.email}`);

  res.status(201).json({
    message: 'Workout logged successfully',
    workout: user.workoutHistory[user.workoutHistory.length - 1],
    streakCount: user.streakCount,
    workedOutToday: true,
  });
};

export const getWorkoutHistory = async (req, res) => {
  const { limit = 20, page = 1 } = req.query;

  const user = await User.findById(req.userId).populate(
    'workoutHistory.exerciseId'
  );

  if (!user) {
    throw new NotFoundError('User');
  }

  const sortedHistory = user.workoutHistory
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice((page - 1) * limit, page * limit);

  const totalWorkouts = user.workoutHistory.length;
  const totalPages = Math.ceil(totalWorkouts / limit);

  res.json({
    workouts: sortedHistory,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalWorkouts,
      hasMore: page < totalPages,
    },
  });
};

export const getWorkoutStats = async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const totalWorkouts = user.workoutHistory.length;
  const streakCount = user.streakCount;
  const lastWorkoutDate = user.lastWorkoutDate;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thisWeek = user.workoutHistory.filter(
    (w) => new Date(w.date) > weekAgo
  ).length;

  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const thisMonth = user.workoutHistory.filter(
    (w) => new Date(w.date) > monthAgo
  ).length;

  const totalMinutes = user.workoutHistory.reduce(
    (sum, w) => sum + (w.duration || 0),
    0
  );

  const recentWorkout =
    user.workoutHistory.length > 0
      ? user.workoutHistory[user.workoutHistory.length - 1]
      : null;

  res.json({
    totalWorkouts,
    streakCount,
    lastWorkoutDate,
    thisWeek,
    thisMonth,
    totalMinutes,
    totalHours: Math.round(totalMinutes / 60),
    recentWorkout,
  });
};

export const deleteWorkout = async (req, res) => {
  const { workoutId } = req.params;

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const workout = user.workoutHistory.id(workoutId);

  if (!workout) {
    throw new NotFoundError('Workout');
  }

  workout.deleteOne();
  await user.save();

  logger.info(`Workout deleted by user ${user.email}`);

  res.json({
    message: 'Workout deleted successfully',
  });
};

export const getWorkoutCalendar = async (req, res) => {
  const { startDate, endDate } = req.query;

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const workoutsInRange = user.workoutHistory.filter((w) => {
    const workoutDate = new Date(w.date);
    return workoutDate >= start && workoutDate <= end;
  });

  const workoutsByDate = {};
  workoutsInRange.forEach((workout) => {
    const date = new Date(workout.date).toISOString().split('T')[0];
    if (!workoutsByDate[date]) {
      workoutsByDate[date] = [];
    }
    workoutsByDate[date].push(workout);
  });

  const calendarData = Object.entries(workoutsByDate).map(
    ([date, workouts]) => ({
      date,
      count: workouts.length,
      workouts,
    })
  );

  res.json({
    calendarData,
    totalDays: Object.keys(workoutsByDate).length,
    totalWorkouts: workoutsInRange.length,
    currentStreak: user.streakCount,
  });
};
