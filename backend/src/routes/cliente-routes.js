const { Router } = require("express");
const { clienteController } = require("../controllers/cliente-controller");
const { requireAuth, requirePermission } = require("../middlewares/auth");
const { validateBody } = require("../middlewares/validate");
const { clienteCreateSchema, clienteUpdateSchema } = require("../schemas/cliente-schema");
const { asyncHandler } = require("../utils/async-handler");

const clienteRoutes = Router();

clienteRoutes.use(requireAuth);
clienteRoutes.get("/", requirePermission("clientes.read"), asyncHandler(clienteController.list));
clienteRoutes.post(
  "/",
  requirePermission("clientes.write"),
  validateBody(clienteCreateSchema),
  asyncHandler(clienteController.create),
);
clienteRoutes.put(
  "/:id",
  requirePermission("clientes.write"),
  validateBody(clienteUpdateSchema),
  asyncHandler(clienteController.update),
);
clienteRoutes.delete("/:id", requirePermission("clientes.delete"), asyncHandler(clienteController.remove));

module.exports = { clienteRoutes };