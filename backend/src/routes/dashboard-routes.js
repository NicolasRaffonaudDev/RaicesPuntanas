const { Router } = require("express");
const { dashboardController } = require("../controllers/dashboard-controller");
const { requireAuth } = require("../middlewares/auth");
const { asyncHandler } = require("../utils/async-handler");

const dashboardRoutes = Router();

dashboardRoutes.get("/me", requireAuth, asyncHandler(dashboardController.me));

module.exports = { dashboardRoutes };
