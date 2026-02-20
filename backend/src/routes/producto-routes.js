const { Router } = require("express");
const { productoController } = require("../controllers/producto-controller");
const { requireAuth, requireRole } = require("../middlewares/auth");
const { validateBody } = require("../middlewares/validate");
const { productoCreateSchema, productoUpdateSchema } = require("../schemas/producto-schema");
const { asyncHandler } = require("../utils/async-handler");

const productoRoutes = Router();

productoRoutes.use(requireAuth);
productoRoutes.get("/", asyncHandler(productoController.list));
productoRoutes.post(
  "/",
  requireRole("admin", "empleado"),
  validateBody(productoCreateSchema),
  asyncHandler(productoController.create),
);
productoRoutes.put(
  "/:id",
  requireRole("admin", "empleado"),
  validateBody(productoUpdateSchema),
  asyncHandler(productoController.update),
);
productoRoutes.delete("/:id", requireRole("admin"), asyncHandler(productoController.remove));

module.exports = { productoRoutes };