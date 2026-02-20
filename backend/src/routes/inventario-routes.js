const { Router } = require("express");
const { inventarioController } = require("../controllers/inventario-controller");
const { requireAuth, requirePermission } = require("../middlewares/auth");
const { validateBody } = require("../middlewares/validate");
const { inventarioMovimientoSchema } = require("../schemas/inventario-schema");
const { asyncHandler } = require("../utils/async-handler");

const inventarioRoutes = Router();

inventarioRoutes.use(requireAuth);
inventarioRoutes.get("/movimientos", requirePermission("inventario.read"), asyncHandler(inventarioController.list));
inventarioRoutes.post(
  "/movimientos",
  requirePermission("inventario.write"),
  validateBody(inventarioMovimientoSchema),
  asyncHandler(inventarioController.createMovement),
);

module.exports = { inventarioRoutes };
