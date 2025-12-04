const Joi = require('joi');
const { createEntry, updateEntry, deleteEntry, listEntries } = require('../services/entry.service');

const querySchema = Joi.object({
  from: Joi.string().isoDate().optional(),
  to: Joi.string().isoDate().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

async function create(req, res, next) {
  try {
    const entry = await createEntry(req.user.id, req.body);
    return res.status(201).json({ entry });
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    const { value, error } = querySchema.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (error) { error.isJoi = true; throw error; }
    const data = await listEntries(req.user.id, value);
    return res.json(data);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const entry = await updateEntry(req.user.id, req.params.id, req.body);
    return res.json({ entry });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await deleteEntry(req.user.id, req.params.id);
    return res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { create, list, update, remove };
