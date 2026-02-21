const { Router } = require("express");
const { userController } = require("../controllers/user-controller");
const { requireAuth, requirePermission } = require("../middlewares/auth");
const { asyncHandler } = require("../utils/async-handler");
const { validateBody } = require("../middlewares/validate");
const { userRoleUpdateSchema, userCreateSchema } = require("../schemas/user-schema");

const userRoutes = Router();

userRoutes.get("/", requireAuth, requirePermission("users.read"), asyncHandler(userController.list));
userRoutes.post(
  "/",
  requireAuth,
  requirePermission("users.manage"),
  validateBody(userCreateSchema),
  asyncHandler(userController.create),
);
userRoutes.patch(
  "/:id/role",
  requireAuth,
  requirePermission("users.read"),
  validateBody(userRoleUpdateSchema),
  asyncHandler(userController.updateRole),
);

module.exports = { userRoutes };
