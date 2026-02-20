const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const { AppError } = require("../utils/app-error");
const { hasPermission } = require("../config/permissions");

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "Token requerido"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (payload.typ && payload.typ !== "access") {
      return next(new AppError(401, "Token invalido para esta operacion"));
    }
    req.auth = payload;
    return next();
  } catch {
    return next(new AppError(401, "Token invalido o vencido"));
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.auth || !roles.includes(req.auth.role)) {
    return next(new AppError(403, "No autorizado para esta accion"));
  }
  return next();
};

const requirePermission = (...permissions) => (req, res, next) => {
  if (!req.auth?.role) return next(new AppError(401, "No autenticado"));

  const allowed = permissions.every((permission) => hasPermission(req.auth.role, permission));
  if (!allowed) return next(new AppError(403, "Permiso insuficiente"));
  return next();
};

module.exports = { requireAuth, requireRole, requirePermission };
