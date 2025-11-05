const Joi = require('joi');
const Entry = require('../models/Entry');
const { startOfDayUTC, daysBetweenUTC } = require('../utils/date');
const { recomputeStreaks } = require('./streak.service');

const EDIT_WINDOW_DAYS = 7;

const entrySchema = Joi.object({
  date: Joi.string().isoDate().required(),
  mood: Joi.number().integer().min(1).max(5).required(),
  sleep: Joi.number().min(0).max(24).required(),
  steps: Joi.number().integer().min(0).max(200000).required(),
  water: Joi.number().min(0).max(15).required(),
  notes: Joi.string().max(1000).allow('', null)
});

async function createEntry(userId, payload) {
  const { value, error } = entrySchema.validate(payload, { abortEarly: false, stripUnknown: true });
  if (error) {
    error.isJoi = true;
    throw error;
  }
  const date = startOfDayUTC(new Date(value.date));
  try {
    const entry = await Entry.create({ ...value, date, userId });
    await recomputeStreaks(userId);
    return entry;
  } catch (err) {
    if (err.code === 11000) {
      const e = new Error('Entry already exists for this day');
      e.code = 'CONFLICT';
      throw e;
    }
    throw err;
  }
}

function assertWithinEditWindow(entryDate) {
  const now = new Date();
  const days = daysBetweenUTC(entryDate, now);
  if (days > (EDIT_WINDOW_DAYS - 1)) {
    const err = new Error('Edit window exceeded (7 days)');
    err.code = 'FORBIDDEN';
    throw err;
  }
}

async function updateEntry(userId, id, payload) {
  const entry = await Entry.findOne({ _id: id, userId });
  if (!entry) {
    const e = new Error('Entry not found');
    e.code = 'NOT_FOUND';
    throw e;
  }
  assertWithinEditWindow(entry.date);

  // Validate updates; allow date change but normalize
  const { value, error } = entrySchema.validate(payload, { abortEarly: false, stripUnknown: true });
  if (error) {
    error.isJoi = true;
    throw error;
  }
  const date = startOfDayUTC(new Date(value.date));
  entry.set({ ...value, date });
  await entry.save();
  await recomputeStreaks(userId);
  return entry;
}

async function deleteEntry(userId, id) {
  const entry = await Entry.findOne({ _id: id, userId });
  if (!entry) return; // idempotent
  assertWithinEditWindow(entry.date);
  await Entry.deleteOne({ _id: id, userId });
  await recomputeStreaks(userId);
}

async function listEntries(userId, { from, to, page = 1, limit = 20 }) {
  let start;
  let end;
  if (from) start = startOfDayUTC(new Date(from));
  if (to) end = startOfDayUTC(new Date(to));
  if (start && end && start > end) {
    const e = new Error('Invalid date range');
    e.code = 'UNPROCESSABLE';
    throw e;
  }
  if (start && end && daysBetweenUTC(start, end) > 365) {
    const e = new Error('Range cannot exceed 365 days');
    e.code = 'UNPROCESSABLE';
    throw e;
  }
  const q = { userId };
  if (start) q.date = { ...q.date, $gte: start };
  if (end) q.date = { ...q.date, $lte: end };

  page = parseInt(page, 10) || 1;
  limit = Math.min(100, parseInt(limit, 10) || 20);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Entry.find(q).sort({ date: -1 }).skip(skip).limit(limit),
    Entry.countDocuments(q)
  ]);

  return { items, page, limit, total };
}

module.exports = { createEntry, updateEntry, deleteEntry, listEntries };

