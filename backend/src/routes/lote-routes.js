const { Router } = require("express");
const { loteController } = require("../controllers/lote-controller");
const { requireAuth, requirePermission } = require("../middlewares/auth");
const { validateBody } = require("../middlewares/validate");
const { loteCreateSchema, loteUpdateSchema } = require("../schemas/lote-schema");
const { asyncHandler } = require("../utils/async-handler");

const loteRoutes = Router();

loteRoutes.get("/by-ids", asyncHandler(loteController.getByIds));
loteRoutes.get("/", asyncHandler(loteController.getAll));
loteRoutes.post(
  "/",
  requireAuth,
  requirePermission("lotes.write"),
  validateBody(loteCreateSchema),
  asyncHandler(loteController.create),
);
loteRoutes.put(
  "/:id",
  requireAuth,
  requirePermission("lotes.write"),
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
