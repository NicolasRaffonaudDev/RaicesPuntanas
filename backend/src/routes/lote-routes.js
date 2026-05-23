const { Router } = require("express");
const { loteController } = require("../controllers/lote-controller");
const { requireAuth, requirePermission } = require("../middlewares/auth");
const { loteImageUpload, normalizeLoteMultipartBody } = require("../middlewares/lote-image-upload");
const { validateBody } = require("../middlewares/validate");
const { loteCreateSchema, loteUpdateSchema } = require("../schemas/lote-schema");
const { asyncHandler } = require("../utils/async-handler");

const loteRoutes = Router();

loteRoutes.get("/by-ids", asyncHandler(loteController.getByIds));
loteRoutes.get("/filters", asyncHandler(loteController.getFilters));
loteRoutes.patch(
  "/:loteId/imagenes/:imagenId/principal",
  requireAuth,
  requirePermission("lotes.write"),
  asyncHandler(loteController.setPrimaryImage),
);
loteRoutes.delete(
  "/:loteId/imagenes/:imagenId",
  requireAuth,
  requirePermission("lotes.write"),
  asyncHandler(loteController.removeImage),
);
loteRoutes.get("/:id", asyncHandler(loteController.getById));
loteRoutes.get("/", asyncHandler(loteController.getAll));
loteRoutes.post(
  "/",
  requireAuth,
  requirePermission("lotes.write"),
  loteImageUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "imagenes", maxCount: 10 },
  ]),
  normalizeLoteMultipartBody,
  validateBody(loteCreateSchema),
  asyncHandler(loteController.create),
);
loteRoutes.put(
  "/:id",
  requireAuth,
  requirePermission("lotes.write"),
  loteImageUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "imagenes", maxCount: 10 },
  ]),
  normalizeLoteMultipartBody,
  validateBody(loteUpdateSchema),
  asyncHandler(loteController.update),
);
loteRoutes.delete(
  "/:id",
  requireAuth,
  requirePermission("lotes.delete"),
  asyncHandler(loteController.remove),
);

module.exports = { loteRoutes };
