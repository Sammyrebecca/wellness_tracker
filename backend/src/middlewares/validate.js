function validate(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.validate(req.body, { abortEarly: false, stripUnknown: true }).value;
      if (schemas.query) req.query = schemas.query.validate(req.query, { abortEarly: false, stripUnknown: true }).value;
      if (schemas.params) req.params = schemas.params.validate(req.params, { abortEarly: false, stripUnknown: true }).value;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { validate };
