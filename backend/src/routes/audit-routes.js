const { Router } = require("express");
const { auditController } = require("../controllers/audit-controller");
const { requireAuth, requirePermission } = require("../middlewares/auth");
const { asyncHandler } = require("../utils/async-handler");

const auditRoutes = Router();

auditRoutes.get("/", requireAuth, requirePermission("audit.read"), asyncHandler(auditController.list));

module.exports = { auditRoutes };
