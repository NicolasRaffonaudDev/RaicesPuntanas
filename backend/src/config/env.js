const { z } = require("zod");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3001),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(12),
  JWT_EXPIRES_IN: z.string().default("8h"),
  DATABASE_URL: z.string().min(1),
  SMTP_FROM: z.string().email().default("no-reply@raicespuntanas.local"),
  SETUP_ADMIN_KEY: z.string().optional(),
});

const env = envSchema.parse(process.env);

module.exports = { env };
