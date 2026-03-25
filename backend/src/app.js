const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { env } = require("./config");
const { apiRoutes } = require("./routes");
const { errorHandler } = require("./middlewares/error-handler");
const { notFoundHandler } = require("./middlewares/not-found");

const app = express();
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

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
  }),
);

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use("/api/auth/login", authLoginLimiter);
app.use("/api/auth/refresh", refreshLimiter);
app.use("/api/auth/setup-admin", setupAdminLimiter);

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
  res.json({ status: "ok", service: "Raices Puntanas API" });
});

app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };
