const { ZodError } = require("zod");
const { env } = require("../config");

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Payload invalido",
      details: err.flatten(),
    });
  }

  const statusCode = err.statusCode || 500;
  const body = {
    message: err.message || "Error interno de servidor",
  };

  if (err.details) body.details = err.details;
  if (env.NODE_ENV !== "production") body.stack = err.stack;

  return res.status(statusCode).json(body);
};

module.exports = { errorHandler };
