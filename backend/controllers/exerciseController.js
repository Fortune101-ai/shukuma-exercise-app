import ExerciseCard from '../models/ExerciseCard.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import { parsePagination, getPaginationMeta } from '../utils/helpers.js';

export const getExercises = async (req, res) => {
  const { difficulty, category, duration, search, sort = 'name' } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const filter = { isActive: true };

  if (difficulty) {
    filter.difficulty = difficulty;
  }

  if (category) {
    filter.category = category;
  }

  if (duration) {
    filter.duration = { $lte: parseInt(duration) };
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const sortOptions = {};
  if (sort === 'name') {
    sortOptions.name = 1;
  } else if (sort === 'difficulty') {
    sortOptions.difficulty = 1;
  } else if (sort === 'duration') {
    sortOptions.duration = 1;
  } else if (sort === 'popular') {
    sortOptions.completionCount = -1;
  }

  const exercises = await ExerciseCard.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  const total = await ExerciseCard.countDocuments(filter);

  res.json({
    exercises,
    pagination: getPaginationMeta(page, limit, total),
  });
};

export const getRandomExercise = async (req, res) => {
  const { difficulty, category } = req.query;

  const filters = { isActive: true };
  if (difficulty) filters.difficulty = difficulty;
  if (category) filters.category = category;

  const exercise = await ExerciseCard.getRandom(filters);

  if (!exercise) {
    throw new NotFoundError('No exercises found matching criteria');
  }

  res.json({
    exercise,
  });
};

export const getExerciseById = async (req, res) => {
  const { id } = req.params;

  const exercise = await ExerciseCard.findById(id);

  if (!exercise) {
    throw new NotFoundError('Exercise');
  }

  res.json({
    exercise,
  });
};

export const getExercisesByCategory = async (req, res) => {
  const { category } = req.params;
  const { limit = 10 } = req.query;

  const exercises = await ExerciseCard.findByCategory(category).limit(
    parseInt(limit)
  );

  res.json({
    category,
    count: exercises.length,
    exercises,
  });
};

export const getExercisesByDifficulty = async (req, res) => {
  const { difficulty } = req.params;
  const { limit = 10 } = req.query;

  const exercises = await ExerciseCard.findByDifficulty(difficulty).limit(
    parseInt(limit)
  );

  res.json({
    difficulty,
    count: exercises.length,
    exercises,
  });
};

export const searchExercises = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      message: 'Search query must be at least 2 characters',
    });
  }

  const exercises = await ExerciseCard.search(q.trim());

  res.json({
    query: q,
    count: exercises.length,
    exercises,
  });
};

export const getPopularExercises = async (req, res) => {
  const { limit = 10 } = req.query;

  const exercises = await ExerciseCard.find({ isActive: true })
    .sort({ completionCount: -1 })
    .limit(parseInt(limit));

  res.json({
    exercises,
  });
};

export const getExerciseStats = async (req, res) => {
  const totalExercises = await ExerciseCard.countDocuments({ isActive: true });

  const byCategory = await ExerciseCard.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  const byDifficulty = await ExerciseCard.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$difficulty', count: { $sum: 1 } } },
  ]);

  res.json({
    totalExercises,
    byCategory,
    byDifficulty,
  });
};

// Add to exerciseController.js
export const createExercise = async (req, res) => {
  const exerciseData = req.body;

  const exercise = new ExerciseCard({
    ...exerciseData,
    isActive: true,
  });

  await exercise.save();

  logger.info(`Exercise created: ${exercise.name}`);

  res.status(201).json({
    message: 'Exercise created successfully',
    exercise,
  });
};
