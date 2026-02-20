const { Router } = require("express");
const { userController } = require("../controllers/user-controller");
const { requireAuth, requireRole } = require("../middlewares/auth");
const { asyncHandler } = require("../utils/async-handler");
const { validateBody } = require("../middlewares/validate");
const { userRoleUpdateSchema } = require("../schemas/user-schema");

const userRoutes = Router();

userRoutes.get("/", requireAuth, requireRole("admin"), asyncHandler(userController.list));
userRoutes.patch(
  "/:id/role",
  requireAuth,
  requireRole("admin"),
  validateBody(userRoleUpdateSchema),
  asyncHandler(userController.updateRole),
);

module.exports = { userRoutes };
