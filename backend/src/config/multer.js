const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const multer = require("multer");
const { AppError } = require("../utils/app-error");
const env = require("./env");

const DEFAULT_UPLOADS_DIR = path.resolve(__dirname, "../../uploads");
let uploadsRootDir = path.resolve(env.UPLOADS_DIR || DEFAULT_UPLOADS_DIR);
let loteUploadsDir = path.join(uploadsRootDir, "lotes");
const LOTE_UPLOADS_PUBLIC_PREFIX = "/uploads/lotes/";
const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

try {
  fs.mkdirSync(loteUploadsDir, { recursive: true });
} catch (error) {
  uploadsRootDir = DEFAULT_UPLOADS_DIR;
  loteUploadsDir = path.join(uploadsRootDir, "lotes");
  fs.mkdirSync(loteUploadsDir, { recursive: true });
  console.warn(`[uploads] fallback to local path due to mount error: ${error.message}`);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, loteUploadsDir);
  },
  filename: (_req, file, cb) => {
    const originalExtension = path.extname(file.originalname || "").toLowerCase();
    const safeExtension = originalExtension || ".bin";
    cb(null, `${Date.now()}-${crypto.randomUUID()}${safeExtension}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
    cb(new AppError(400, "Solo se permiten imagenes PNG, JPG o WEBP"));
    return;
  }

  cb(null, true);
};

const loteImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 12,
  },
});

module.exports = {
  loteImageUpload,
  UPLOADS_ROOT_DIR: uploadsRootDir,
  LOTE_UPLOADS_DIR: loteUploadsDir,
  LOTE_UPLOADS_PUBLIC_PREFIX,
};
