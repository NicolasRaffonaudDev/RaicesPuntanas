const { Router } = require("express");
const { favoritoController } = require("../controllers/favorito-controller");
const { requireAuth, requirePermission } = require("../middlewares/auth");
const { asyncHandler } = require("../utils/async-handler");

const favoritoRoutes = Router();

favoritoRoutes.use(requireAuth);
favoritoRoutes.get("/", requirePermission("favoritos.read"), asyncHandler(favoritoController.listMine));
favoritoRoutes.post(
  "/:loteId",
  requirePermission("favoritos.write"),
  asyncHandler(favoritoController.add),
);
favoritoRoutes.delete(
  "/:loteId",
  requirePermission("favoritos.write"),
  asyncHandler(favoritoController.remove),
);

module.exports = { favoritoRoutes };