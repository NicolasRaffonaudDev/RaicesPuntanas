const fs = require("node:fs/promises");
const path = require("node:path");
const { LOTE_UPLOADS_PUBLIC_PREFIX, UPLOADS_ROOT_DIR } = require("../config/multer");

const normalizeUploadPublicPath = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
};

const isLocalLoteImagePath = (value) => {
  const normalized = normalizeUploadPublicPath(value);
  return Boolean(normalized && normalized.startsWith(LOTE_UPLOADS_PUBLIC_PREFIX));
};

const getAbsolutePathFromPublicUpload = (publicPath) => {
  const normalized = normalizeUploadPublicPath(publicPath);
  if (!normalized || !normalized.startsWith("/uploads/")) return null;

  const relativePath = normalized.replace(/^\/uploads\/+/, "");
  const absolutePath = path.resolve(UPLOADS_ROOT_DIR, relativePath);

  if (!absolutePath.startsWith(UPLOADS_ROOT_DIR)) return null;
  return absolutePath;
};

const deleteAbsoluteFile = async (absolutePath) => {
  if (!absolutePath) return;

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error && error.code !== "ENOENT") {
      console.warn("[uploads] could_not_delete_file", absolutePath, error.message);
    }
  }
};

const deleteLocalLoteImage = async (imagePath) => {
  if (!isLocalLoteImagePath(imagePath)) return;
  const absolutePath = getAbsolutePathFromPublicUpload(imagePath);
  await deleteAbsoluteFile(absolutePath);
};

module.exports = {
  isLocalLoteImagePath,
  getAbsolutePathFromPublicUpload,
  deleteAbsoluteFile,
  deleteLocalLoteImage,
};
