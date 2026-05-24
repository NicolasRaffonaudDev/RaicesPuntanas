const { AppError } = require("../utils/app-error");
const { loteImageUpload, LOTE_UPLOADS_PUBLIC_PREFIX } = require("../config/multer");

const normalizeStringArray = (value) => {
  if (value === undefined) return undefined;
  const source = Array.isArray(value) ? value : [value];

  const values = source
    .flatMap((item) => {
      if (typeof item !== "string") return [];
      const trimmed = item.trim();
      if (!trimmed) return [];
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          const parsed = JSON.parse(trimmed);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return trimmed.split(",");
        }
      }
      return trimmed.split(",");
    })
    .map((item) => String(item).trim())
    .filter(Boolean);

  return values;
};

const normalizeNullableString = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const normalized = String(value).trim();
  return normalized ? normalized : null;
};

const normalizeNumber = (value, fieldName) => {
  if (value === undefined) return undefined;
  if (typeof value === "number") return value;
  const normalized = Number(String(value).trim());
  if (!Number.isFinite(normalized)) {
    throw new AppError(400, `El campo ${fieldName} debe ser numerico`);
  }
  return normalized;
};

const normalizeBoolean = (value, fieldName) => {
  if (value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "true" || normalized === "1") return true;
  if (normalized === "false" || normalized === "0") return false;
  throw new AppError(400, `El campo ${fieldName} debe ser booleano`);
};

const normalizeLoteMultipartBody = (req, _res, next) => {
  try {
    const fieldFiles = req.files && typeof req.files === "object" && !Array.isArray(req.files) ? req.files : {};
    const singleImageFile = req.file || fieldFiles.image?.[0];
    const galleryFiles = fieldFiles.imagenes || [];
    const uploadedPaths = [];

    if (singleImageFile?.filename) {
      uploadedPaths.push(`${LOTE_UPLOADS_PUBLIC_PREFIX}${singleImageFile.filename}`);
    }

    galleryFiles.forEach((file) => {
      if (file?.filename) {
        uploadedPaths.push(`${LOTE_UPLOADS_PUBLIC_PREFIX}${file.filename}`);
      }
    });

    if (uploadedPaths.length > 0) {
      req.body.image = uploadedPaths[0];
      req.body.uploadedImages = uploadedPaths;
    }

    req.body = {
      ...req.body,
      amenities: normalizeStringArray(req.body.amenities),
      title: req.body.title === undefined ? undefined : String(req.body.title).trim(),
      image: req.body.image === undefined ? undefined : String(req.body.image).trim(),
      address: normalizeNullableString(req.body.address),
      description: normalizeNullableString(req.body.description),
      price: normalizeNumber(req.body.price, "price"),
      size: normalizeNumber(req.body.size, "size"),
      destacado: normalizeBoolean(req.body.destacado, "destacado"),
      lat: normalizeNumber(req.body.lat, "lat"),
      lng: normalizeNumber(req.body.lng, "lng"),
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loteImageUpload,
  normalizeLoteMultipartBody,
};
