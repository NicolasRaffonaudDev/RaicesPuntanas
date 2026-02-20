const { Router } = require("express");
const { ventaController } = require("../controllers/venta-controller");
const { requireAuth, requireRole } = require("../middlewares/auth");
const { validateBody } = require("../middlewares/validate");
const { ventaCreateSchema } = require("../schemas/venta-schema");
const { asyncHandler } = require("../utils/async-handler");

const ventaRoutes = Router();

ventaRoutes.use(requireAuth);
ventaRoutes.get("/", asyncHandler(ventaController.list));
ventaRoutes.post(
  "/",
  requireRole("admin", "empleado"),
  validateBody(ventaCreateSchema),
  asyncHandler(ventaController.create),
);

module.exports = { ventaRoutes };