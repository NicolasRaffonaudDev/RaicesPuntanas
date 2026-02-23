const { z } = require("zod");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3001),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(12),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().int().min(1).default(14),
  MAX_LOGIN_ATTEMPTS: z.coerce.number().int().min(1).default(5),
  LOCKOUT_MINUTES: z.coerce.number().int().min(1).default(15),
  DATABASE_URL: z.string().min(1),
  SMTP_FROM: z.string().email().default("no-reply@raicespuntanas.local"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: z.coerce.boolean().optional(),
  SETUP_ADMIN_KEY: z.string().optional(),
});

const env = envSchema.parse(process.env);

module.exports = { env };
