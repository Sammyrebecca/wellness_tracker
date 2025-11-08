const Joi = require('joi');
const { getById, updateMe } = require('../services/user.service');

const updateSchema = Joi.object({
  name: Joi.string().min(1).optional(),
  preferences: Joi.object({
    focusArea: Joi.string().optional(),
    reminderTime: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
    darkMode: Joi.boolean().optional(),
    stepGoal: Joi.number().integer().min(0).max(200000).optional(),
    waterGoal: Joi.number().min(0).max(15).optional(),
    sleepGoal: Joi.number().min(0).max(24).optional()
  }).optional()
});

async function me(req, res, next) {
  try {
    const user = await getById(req.user.id);
    return res.json({ user });
  } catch (err) { next(err); }
}

async function updateProfile(req, res, next) {
  try {
    const { value, error } = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) { error.isJoi = true; throw error; }
    const user = await updateMe(req.user.id, value);
    return res.json({ user });
  } catch (err) { next(err); }
}

async function deleteAccount(_req, res) {
  // Placeholder for future implementation
  return res.status(501).json({ message: 'TODO: Account deletion not implemented yet' });
}

module.exports = { me, updateProfile, deleteAccount };
