const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const fs = require("node:fs");
const path = require("node:path");
const rateLimit = require("express-rate-limit");
const { env } = require("./config");
const { UPLOADS_ROOT_DIR } = require("./config/multer");
const { prisma } = require("./db/prisma");
const { apiRoutes } = require("./routes");
const { errorHandler } = require("./middlewares/error-handler");
const { notFoundHandler } = require("./middlewares/not-found");

const app = express();
app.set("trust proxy", 1);

const authLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados intentos de login, intenta mas tarde" },
});

const refreshLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiadas renovaciones de token, intenta mas tarde" },
});
const setupAdminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados intentos de bootstrap admin, intenta mas tarde" },
});
const publicConsultaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiadas consultas publicas en poco tiempo, intenta mas tarde" },
});

app.use(
  cors({
    origin: env.FRONTEND_ORIGINS,
    credentials: true,
  }),
);

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use("/api/auth/login", authLoginLimiter);
app.use("/api/auth/refresh", refreshLimiter);
app.use("/api/auth/setup-admin", setupAdminLimiter);
app.use("/api/consultas/public", publicConsultaLimiter);

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/health/details", async (req, res) => {
  let dbConnected = false;
  let uploadsDirWritable = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  try {
    fs.accessSync(path.resolve(UPLOADS_ROOT_DIR), fs.constants.W_OK);
    uploadsDirWritable = true;
  } catch {
    uploadsDirWritable = false;
  }

  res.json({
    status: dbConnected ? "ok" : "degraded",
    dbConnected,
    uploadsDirWritable,
    nodeEnv: env.NODE_ENV,
    uptime: Math.floor(process.uptime()),
  });
});

app.use("/uploads", express.static(UPLOADS_ROOT_DIR));
app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };
