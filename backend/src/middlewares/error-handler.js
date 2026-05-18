const fs = require("node:fs/promises");
const multer = require("multer");
const { ZodError } = require("zod");
const { env } = require("../config");

const cleanupUploadedFile = async (req) => {
  if (!req.file?.path) return;

  try {
    await fs.unlink(req.file.path);
  } catch (cleanupError) {
    if (cleanupError.code !== "ENOENT") {
      console.warn("[uploads] cleanup_failed", req.file.path, cleanupError.message);
    }
  }
};

const errorHandler = async (err, req, res, next) => {
  if (res.headersSent) return next(err);

  await cleanupUploadedFile(req);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "La imagen supera el maximo permitido de 5MB" });
    }

    return res.status(400).json({ message: err.message || "Error al procesar el archivo subido" });
  }

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
