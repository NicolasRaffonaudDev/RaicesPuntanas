const { Router } = require("express");
const { authController } = require("../controllers/auth-controller");
const { asyncHandler } = require("../utils/async-handler");
const { validateBody } = require("../middlewares/validate");
const {
  registerSchema,
  loginSchema,
  passwordResetSchema,
  setupAdminSchema,
  refreshSchema,
  logoutSchema,
} = require("../schemas/auth-schema");
const { requireAuth } = require("../middlewares/auth");

const authRoutes = Router();

authRoutes.post("/register", validateBody(registerSchema), asyncHandler(authController.register));
authRoutes.post("/login", validateBody(loginSchema), asyncHandler(authController.login));
authRoutes.post("/refresh", validateBody(refreshSchema), asyncHandler(authController.refresh));
authRoutes.post("/logout", validateBody(logoutSchema), asyncHandler(authController.logout));
authRoutes.post("/logout-all", requireAuth, asyncHandler(authController.logoutAll));
authRoutes.post(
  "/password-reset",
  validateBody(passwordResetSchema),
  asyncHandler(authController.passwordReset),
);
authRoutes.post("/setup-admin", validateBody(setupAdminSchema), asyncHandler(authController.setupAdmin));

module.exports = { authRoutes };
