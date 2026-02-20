const { Router } = require("express");
const { auditController } = require("../controllers/audit-controller");
const { requireAuth, requireRole } = require("../middlewares/auth");
const { asyncHandler } = require("../utils/async-handler");

const auditRoutes = Router();

auditRoutes.get("/", requireAuth, requireRole("admin"), asyncHandler(auditController.list));

module.exports = { auditRoutes };
