const { Router } = require("express");
const { ventaController } = require("../controllers/venta-controller");
const { requireAuth, requirePermission } = require("../middlewares/auth");
const { validateBody } = require("../middlewares/validate");
const { ventaCreateSchema } = require("../schemas/venta-schema");
const { asyncHandler } = require("../utils/async-handler");

const ventaRoutes = Router();

ventaRoutes.use(requireAuth);
ventaRoutes.get("/", requirePermission("ventas.read"), asyncHandler(ventaController.list));
ventaRoutes.post(
  "/",
  requirePermission("ventas.write"),
  validateBody(ventaCreateSchema),
  asyncHandler(ventaController.create),
);

module.exports = { ventaRoutes };