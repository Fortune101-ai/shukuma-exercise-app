import User from '../models/User.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import { parsePagination, getPaginationMeta } from '../utils/helpers.js';
import logger from '../utils/logger.js';

export const logTrigger = async (req, res) => {
  const { trigger, notes } = req.body;

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  user.triggers.push({
    trigger,
    notes,
    date: new Date(),
  });

  await user.save();

  const newTrigger = user.triggers[user.triggers.length - 1];

  logger.info(`Trigger logged by user ${user.email}`);

  res.status(201).json({
    message: 'Trigger logged successfully',
    trigger: newTrigger,
  });
};

export const getTriggers = async (req, res) => {
  const { search, startDate, endDate } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  let triggers = user.triggers;

  if (search) {
    const searchLower = search.toLowerCase();
    triggers = triggers.filter(
      (t) =>
        t.trigger.toLowerCase().includes(searchLower) ||
        (t.notes && t.notes.toLowerCase().includes(searchLower))
    );
  }

  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    triggers = triggers.filter((t) => {
      const triggerDate = new Date(t.date);
      return triggerDate >= start && triggerDate <= end;
    });
  }

  triggers = triggers.sort((a, b) => new Date(b.date) - new Date(a.date));

  const total = triggers.length;
  const paginatedTriggers = triggers.slice(skip, skip + limit);

  res.json({
    triggers: paginatedTriggers,
    pagination: getPaginationMeta(page, limit, total),
  });
};

export const getTriggerById = async (req, res) => {
  const { triggerId } = req.params;

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const trigger = user.triggers.id(triggerId);

  if (!trigger) {
    throw new NotFoundError('Trigger');
  }

  res.json({
    trigger,
  });
};

export const updateTrigger = async (req, res) => {
  const { triggerId } = req.params;
  const { trigger, notes } = req.body;

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const triggerDoc = user.triggers.id(triggerId);

  if (!triggerDoc) {
    throw new NotFoundError('Trigger');
  }

  if (trigger) triggerDoc.trigger = trigger;
  if (notes !== undefined) triggerDoc.notes = notes;

  await user.save();

  logger.info(`Trigger updated: ${triggerId} by user ${user.email}`);

  res.json({
    message: 'Trigger updated successfully',
    trigger: triggerDoc,
  });
};

export const deleteTrigger = async (req, res) => {
  const { triggerId } = req.params;

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const trigger = user.triggers.id(triggerId);

  if (!trigger) {
    throw new NotFoundError('Trigger');
  }

  trigger.deleteOne();
  await user.save();

  logger.info(`Trigger deleted: ${triggerId} by user ${user.email}`);

  res.json({
    message: 'Trigger deleted successfully',
  });
};

export const getTriggerStats = async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const totalTriggers = user.triggers.length;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const triggersThisWeek = user.triggers.filter(
    (t) => new Date(t.date) > weekAgo
  ).length;

  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const triggersThisMonth = user.triggers.filter(
    (t) => new Date(t.date) > monthAgo
  ).length;

  const triggerCounts = {};
  user.triggers.forEach((t) => {
    const key = t.trigger.toLowerCase();
    triggerCounts[key] = (triggerCounts[key] || 0) + 1;
  });

  const commonTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([trigger, count]) => ({ trigger, count }));

  res.json({
    totalTriggers,
    triggersThisWeek,
    triggersThisMonth,
    commonTriggers,
  });
};
