import User from '../models/User.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import {
  parsePagination,
  getPaginationMeta,
  getDateRange,
} from '../utils/helpers.js';
import logger from '../utils/logger.js';

export const createJournalEntry = async (req, res) => {
  const { title, content, mood } = req.body;

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  user.journal.push({
    title,
    content,
    mood,
    date: new Date(),
  });

  await user.save();

  const newEntry = user.journal[user.journal.length - 1];

  logger.info(`Journal entry created by user ${user.email}`);

  res.status(201).json({
    message: 'Journal entry created successfully',
    entry: newEntry,
  });
};

export const getJournalEntries = async (req, res) => {
  const { mood, search, startDate, endDate, sortBy = 'date' } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  let entries = user.journal;

  if (mood) {
    entries = entries.filter((entry) => entry.mood === mood);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    entries = entries.filter(
      (entry) =>
        (entry.title && entry.title.toLowerCase().includes(searchLower)) ||
        entry.content.toLowerCase().includes(searchLower)
    );
  }

  if (startDate || endDate) {
    const {start,end} = getDateRange(startDate || new Date(0), endDate || new Date())

    entries = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    });
  }

  if (sortBy === 'date') {
    entries = entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortBy === 'oldest') {
    entries = entries.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  const total = entries.length;
  const paginatedEntries = entries.slice(skip, skip + limit);

  res.json({
    entries: paginatedEntries,
    pagination: getPaginationMeta(page, limit, total),
    summary: {
      totalEntries: user.journal.length,
      filteredEntries: total,
    },
  });
};

export const getJournalEntryById = async (req, res) => {
  const { entryId } = req.params;

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const entry = user.journal.id(entryId);

  if (!entry) {
    throw new NotFoundError('Journal entry');
  }

  res.json({
    entry,
  });
};

export const updateJournalEntry = async (req, res) => {
  const { entryId } = req.params;
  const { title, content, mood } = req.body;

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const entry = user.journal.id(entryId);

  if (!entry) {
    throw new NotFoundError('Journal entry');
  }

  if (title !== undefined) {
    entry.title = title;
  }
  if (content !== undefined) {
    entry.content = content;
  }
  if (mood !== undefined) {
    entry.mood = mood;
  }

  await user.save();

  logger.info(`Journal entry updated: ${entryId} by user ${user.email}`);

  res.json({
    message: 'Journal entry updated successfully',
    entry,
  });
};

export const deleteJournalEntry = async (req, res) => {
  const { entryId } = req.params;

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const entry = user.journal.id(entryId);

  if (!entry) {
    throw new NotFoundError('Journal entry');
  }

  entry.deleteOne();
  await user.save();

  logger.info(`Journal entry deleted: ${entryId} by user ${user.email}`);

  res.json({
    message: 'Journal entry deleted successfully',
  });
};

export const getJournalStats = async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const totalEntries = user.journal.length;

  const moodCounts = {
    great: 0,
    good: 0,
    okay: 0,
    bad: 0,
    terrible: 0,
    unspecified: 0,
  };

  user.journal.forEach((entry) => {
    if (entry.mood) {
      moodCounts[entry.mood]++;
    } else {
      moodCounts.unspecified++;
    }
  });

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const entriesThisWeek = user.journal.filter(
    (e) => new Date(e.date) > weekAgo
  ).length;

  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const entriesThisMonth = user.journal.filter(
    (e) => new Date(e.date) > monthAgo
  ).length;

  const averagePerWeek = totalEntries > 0 ? (totalEntries / 4).toFixed(1) : 0;

  let mostCommonMood = 'None';
  let maxCount = 0;
  Object.entries(moodCounts).forEach(([mood, count]) => {
    if (count > maxCount && mood !== 'unspecified') {
      maxCount = count;
      mostCommonMood = mood.charAt(0).toUpperCase() + mood.slice(1);
    }
  });

  res.json({
    totalEntries,
    entriesThisWeek,
    entriesThisMonth,
    averagePerWeek: parseFloat(averagePerWeek),
    moodCounts,
    mostCommonMood,
  });
};

export const getMoodTrends = async (req, res) => {
  const { days = 30 } = req.query;

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const daysAgo = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
  const recentEntries = user.journal.filter((e) => new Date(e.date) > daysAgo);

  const moodByDate = {};

  recentEntries.forEach((entry) => {
    if (entry.mood) {
      const date = new Date(entry.date).toISOString().split('T')[0];
      if (!moodByDate[date]) {
        moodByDate[date] = [];
      }
      moodByDate[date].push(entry.mood);
    }
  });

  const moodValues = {
    terrible: 1,
    bad: 2,
    okay: 3,
    good: 4,
    great: 5,
  };

  const trends = Object.entries(moodByDate).map(([date, moods]) => {
    const avgValue =
      moods.reduce((sum, mood) => sum + moodValues[mood], 0) / moods.length;
    return {
      date,
      averageMood: avgValue.toFixed(1),
      entries: moods.length,
    };
  });

  trends.sort((a, b) => new Date(a.date) - new Date(b.date));

  res.json({
    trends,
    period: `Last ${days} days`,
    totalEntries: recentEntries.length,
  });
};

export const searchJournalEntries = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      message: 'Search query must be at least 2 characters',
    });
  }

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const searchLower = q.toLowerCase();

  const results = user.journal.filter(
    (entry) =>
      (entry.title && entry.title.toLowerCase().includes(searchLower)) ||
      entry.content.toLowerCase().includes(searchLower)
  );

  results.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({
    query: q,
    count: results.length,
    entries: results,
  });
};

export const getRecentEntries = async (req, res) => {
  const { limit = 5 } = req.query;

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const recentEntries = user.journal
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, parseInt(limit));

  res.json({
    entries: recentEntries,
  });
};
