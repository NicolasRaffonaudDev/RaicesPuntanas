const { Router } = require("express");
const { productoController } = require("../controllers/producto-controller");
const { requireAuth, requirePermission } = require("../middlewares/auth");
const { validateBody } = require("../middlewares/validate");
const { productoCreateSchema, productoUpdateSchema } = require("../schemas/producto-schema");
const { asyncHandler } = require("../utils/async-handler");

const productoRoutes = Router();

productoRoutes.use(requireAuth);
productoRoutes.get("/", requirePermission("productos.read"), asyncHandler(productoController.list));
productoRoutes.post(
  "/",
  requirePermission("productos.write"),
  validateBody(productoCreateSchema),
  asyncHandler(productoController.create),
);
productoRoutes.put(
  "/:id",
  requirePermission("productos.write"),
  validateBody(productoUpdateSchema),
  asyncHandler(productoController.update),
);
productoRoutes.delete("/:id", requirePermission("productos.delete"), asyncHandler(productoController.remove));

module.exports = { productoRoutes };