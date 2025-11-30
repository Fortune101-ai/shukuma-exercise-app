import User from '../models/User.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import {
  parsePagination,
  getPaginationMeta,
  getDateRange,
} from '../utils/helpers.js';
import logger from '../utils/logger.js';

export const logFood = async (req, res) => {
  const { date, meals, notes } = req.body;

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  user.foodLogs.push({
    date: new Date(date),
    meals,
    notes,
  });

  await user.save();

  const newLog = user.foodLogs[user.foodLogs.length - 1];

  logger.info(`Food log created by user ${user.email}`);

  res.status(201).json({
    message: 'Food log created successfully',
    foodLog: newLog,
  });
};

export const getFoodLogs = async (req, res) => {
  const { startDate, endDate, date } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  let logs = user.foodLogs;

  if (date) {
    const targetDate = new Date(date).toISOString().split('T')[0];
    logs = logs.filter((log) => {
      const logDate = new Date(log.date).toISOString().split('T')[0];
      return logDate === targetDate;
    });
  } else if (startDate || endDate) {
    const { start, end } = getDateRange(
      startDate || new Date(0),
      endDate || new Date()
    );

    logs = logs.filter((log) => {
      const logDate = new Date(log.date);
      return logDate >= start && logDate <= end;
    });
  }

  logs = logs.sort((a, b) => new Date(b.date) - new Date(a.date));

  const total = logs.length;
  const paginatedLogs = logs.slice(skip, skip + limit);

  res.json({
    foodLogs: paginatedLogs,
    pagination: getPaginationMeta(page, limit, total),
  });
};

export const getFoodLogById = async (req, res) => {
  const { logId } = req.params;

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const foodLog = user.foodLogs.id(logId);

  if (!foodLog) {
    throw new NotFoundError('Food log');
  }

  res.json({
    foodLog,
  });
};

export const updateFoodLog = async (req, res) => {
  const { logId } = req.params;
  const { date, meals, notes } = req.body;

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const foodLog = user.foodLogs.id(logId);

  if (!foodLog) {
    throw new NotFoundError('Food log');
  }

  if (date) foodLog.date = new Date(date);
  if (meals) foodLog.meals = meals;
  if (notes !== undefined) foodLog.notes = notes;

  await user.save();

  logger.info(`Food log updated: ${logId} by user ${user.email}`);

  res.json({
    message: 'Food log updated successfully',
    foodLog,
  });
};

export const deleteFoodLog = async (req, res) => {
  const { logId } = req.params;

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const foodLog = user.foodLogs.id(logId);

  if (!foodLog) {
    throw new NotFoundError('Food log');
  }

  foodLog.deleteOne();
  await user.save();

  logger.info(`Food log deleted: ${logId} by user ${user.email}`);

  res.json({
    message: 'Food log deleted successfully',
  });
};

export const getMealGuides = async (req, res) => {
  const guides = [
    {
      name: 'Breakfast Ideas',
      meals: [
        { name: 'Oatmeal with berries', calories: 300 },
        { name: 'Eggs and toast', calories: 350 },
        { name: 'Greek yogurt with granola', calories: 250 },
        { name: 'Smoothie bowl', calories: 280 },
      ],
    },
    {
      name: 'Lunch Ideas',
      meals: [
        { name: 'Grilled chicken salad', calories: 400 },
        { name: 'Turkey sandwich', calories: 450 },
        { name: 'Brown rice bowl', calories: 500 },
        { name: 'Quinoa salad', calories: 380 },
      ],
    },
    {
      name: 'Dinner Ideas',
      meals: [
        { name: 'Salmon with vegetables', calories: 550 },
        { name: 'Chicken stir-fry', calories: 480 },
        { name: 'Whole wheat pasta', calories: 520 },
        { name: 'Grilled steak with salad', calories: 600 },
      ],
    },
    {
      name: 'Snack Ideas',
      meals: [
        { name: 'Mixed nuts', calories: 180 },
        { name: 'Apple with peanut butter', calories: 200 },
        { name: 'Protein bar', calories: 220 },
        { name: 'Hummus with veggies', calories: 150 },
      ],
    },
  ];

  res.json({
    guides,
  });
};

export const getNutritionStats = async (req, res) => {
  const { days = 7 } = req.query;

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const daysAgo = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
  const recentLogs = user.foodLogs.filter(
    (log) => new Date(log.date) > daysAgo
  );

  let totalCalories = 0;
  let totalMeals = 0;

  recentLogs.forEach((log) => {
    if (log.meals) {
      log.meals.forEach((meal) => {
        if (meal.calories) {
          totalCalories += meal.calories;
        }
        totalMeals++;
      });
    }
  });

  const averageCaloriesPerDay =
    recentLogs.length > 0 ? Math.round(totalCalories / parseInt(days)) : 0;

  res.json({
    totalLogs: user.foodLogs.length,
    logsInPeriod: recentLogs.length,
    period: `Last ${days} days`,
    totalMeals,
    totalCalories,
    averageCaloriesPerDay,
  });
};
