const { AppError } = require("../utils/app-error");

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(new AppError(400, "Payload invalido", result.error.flatten()));
  }

  req.body = result.data;
  return next();
};

module.exports = { validateBody };
