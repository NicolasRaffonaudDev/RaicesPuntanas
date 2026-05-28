const { z } = require("zod");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(12),
  ACCESS_TOKEN_EXPIRES_IN: z.string().min(1).default("15m"),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().int().min(1).default(14),
  MAX_LOGIN_ATTEMPTS: z.coerce.number().int().min(1).default(5),
  LOCKOUT_MINUTES: z.coerce.number().int().min(1).default(15),
  FRONTEND_URL: z.string().url().optional(),
  FRONTEND_ORIGIN: z.string().min(1).default("http://localhost:5173"),
  UPLOADS_DIR: z.string().min(1).default("uploads"),
  REFRESH_TOKEN_SECRET: z.string().min(12).optional(),
  SMTP_FROM: z.string().email().default("no-reply@raicespuntanas.local"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  SETUP_ADMIN_KEY: z.string().optional(),
  API_BASE_URL: z.string().optional(),
  SMOKE_ADMIN_EMAIL: z.string().optional(),
  SMOKE_ADMIN_PASSWORD: z.string().optional(),
  SMOKE_TEST_PASSWORD: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ");
  throw new Error(`Configuracion de entorno invalida: ${details}`);
}

const env = {
  ...parsed.data,
  FRONTEND_ORIGIN: parsed.data.FRONTEND_URL || parsed.data.FRONTEND_ORIGIN,
};

env.FRONTEND_ORIGINS = env.FRONTEND_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

module.exports = env;
