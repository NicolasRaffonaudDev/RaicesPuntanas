const { Router } = require("express");
const { consultaController } = require("../controllers/consulta-controller");
const { requireAuth, requirePermission } = require("../middlewares/auth");
const { validateBody } = require("../middlewares/validate");
const {
  consultaCreateSchema,
  publicConsultaCreateSchema,
  consultaUpdateSchema,
  consultaBulkUpdateSchema,
  consultaSeguimientoCreateSchema,
} = require("../schemas/consulta-schema");
const { asyncHandler } = require("../utils/async-handler");

const consultaRoutes = Router();

consultaRoutes.post(
  "/public",
  validateBody(publicConsultaCreateSchema),
  asyncHandler(consultaController.createPublic),
);

consultaRoutes.use(requireAuth);
consultaRoutes.post(
  "/",
  requirePermission("consultas.write"),
  validateBody(consultaCreateSchema),
  asyncHandler(consultaController.create),
);
consultaRoutes.get("/mine", requirePermission("consultas.read"), asyncHandler(consultaController.listMine));
consultaRoutes.get("/", requirePermission("consultas.manage"), asyncHandler(consultaController.listAll));
consultaRoutes.patch(
  "/status",
  requirePermission("consultas.manage"),
  validateBody(consultaBulkUpdateSchema),
  asyncHandler(consultaController.updateEstadoMany),
);
consultaRoutes.patch(
  "/:id/estado",
  requirePermission("consultas.manage"),
  validateBody(consultaUpdateSchema),
  asyncHandler(consultaController.updateEstado),
);
consultaRoutes.get(
  "/:id/seguimientos",
  requirePermission("consultas.read"),
  asyncHandler(consultaController.listSeguimientos),
);
consultaRoutes.post(
  "/:id/seguimientos",
  requirePermission("consultas.manage"),
  validateBody(consultaSeguimientoCreateSchema),
  asyncHandler(consultaController.addSeguimiento),
);

module.exports = { consultaRoutes };
