const { Router } = require("express");
const { inventarioController } = require("../controllers/inventario-controller");
const { requireAuth, requireRole } = require("../middlewares/auth");
const { validateBody } = require("../middlewares/validate");
const { inventarioMovimientoSchema } = require("../schemas/inventario-schema");
const { asyncHandler } = require("../utils/async-handler");

const inventarioRoutes = Router();

inventarioRoutes.use(requireAuth, requireRole("admin", "empleado"));
inventarioRoutes.get("/movimientos", asyncHandler(inventarioController.list));
inventarioRoutes.post(
  "/movimientos",
  validateBody(inventarioMovimientoSchema),
  asyncHandler(inventarioController.createMovement),
);

module.exports = { inventarioRoutes };