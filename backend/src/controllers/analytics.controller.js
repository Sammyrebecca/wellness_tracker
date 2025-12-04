const Joi = require('joi');
const { correlations } = require('../services/correlation.service');

const querySchema = Joi.object({ window: Joi.number().valid(7, 14, 30).optional() });

async function correlation(req, res, next) {
  try {
    const { value, error } = querySchema.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (error) { error.isJoi = true; throw error; }
    const data = await correlations(req.user.id, value.window || 30);
    return res.json(data);
  } catch (err) { next(err); }
}

module.exports = { correlation };
