const { z } = require("zod");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive(),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(12),
  ACCESS_TOKEN_EXPIRES_IN: z.string().min(1),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().int().min(1),
  MAX_LOGIN_ATTEMPTS: z.coerce.number().int().min(1),
  LOCKOUT_MINUTES: z.coerce.number().int().min(1),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:5173"),
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

const env = parsed.data;

module.exports = env;
