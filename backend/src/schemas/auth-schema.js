const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
});

const passwordResetSchema = z.object({
  email: z.string().trim().email(),
});

const setupAdminSchema = z.object({
  setupKey: z.string().min(8),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

module.exports = { registerSchema, loginSchema, passwordResetSchema, setupAdminSchema };
