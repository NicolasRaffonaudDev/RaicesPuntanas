const { Router } = require("express");
const { authController } = require("../controllers/auth-controller");
const { asyncHandler } = require("../utils/async-handler");
const { validateBody } = require("../middlewares/validate");
const {
  registerSchema,
  loginSchema,
  passwordResetSchema,
  setupAdminSchema,
} = require("../schemas/auth-schema");

const authRoutes = Router();

authRoutes.post("/register", validateBody(registerSchema), asyncHandler(authController.register));
authRoutes.post("/login", validateBody(loginSchema), asyncHandler(authController.login));
authRoutes.post(
  "/password-reset",
  validateBody(passwordResetSchema),
  asyncHandler(authController.passwordReset),
);
authRoutes.post("/setup-admin", validateBody(setupAdminSchema), asyncHandler(authController.setupAdmin));

module.exports = { authRoutes };
