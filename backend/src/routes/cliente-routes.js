const { Router } = require("express");
const { clienteController } = require("../controllers/cliente-controller");
const { requireAuth, requireRole } = require("../middlewares/auth");
const { validateBody } = require("../middlewares/validate");
const { clienteCreateSchema, clienteUpdateSchema } = require("../schemas/cliente-schema");
const { asyncHandler } = require("../utils/async-handler");

const clienteRoutes = Router();

clienteRoutes.use(requireAuth);
clienteRoutes.get("/", asyncHandler(clienteController.list));
clienteRoutes.post(
  "/",
  requireRole("admin", "empleado"),
  validateBody(clienteCreateSchema),
  asyncHandler(clienteController.create),
);
clienteRoutes.put(
  "/:id",
  requireRole("admin", "empleado"),
  validateBody(clienteUpdateSchema),
  asyncHandler(clienteController.update),
);
clienteRoutes.delete("/:id", requireRole("admin"), asyncHandler(clienteController.remove));

module.exports = { clienteRoutes };