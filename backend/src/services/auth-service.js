const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { AppError } = require("../utils/app-error");
const { userRepository } = require("../repositories/user-repository");
const { refreshTokenRepository } = require("../repositories/refresh-token-repository");
const { env } = require("../config");
const { auditService } = require("./audit-service");
const { emailService } = require("./email-service");

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

const createAccessToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
      typ: "access",
    },
    env.JWT_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN },
  );

const hashToken = (value) => crypto.createHash("sha256").update(value).digest("hex");

const createSession = async (user) => {
  const accessToken = createAccessToken(user);
  const refreshToken = crypto.randomBytes(48).toString("hex");
  const refreshHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  await refreshTokenRepository.create({
    userId: user.id,
    tokenHash: refreshHash,
    expiresAt,
  });

  return {
    token: accessToken,
    accessToken,
    refreshToken,
    user: sanitizeUser(user),
  };
};

const assertUserNotLocked = (user) => {
  if (!user.lockedUntil) return;

  if (user.lockedUntil.getTime() > Date.now()) {
    throw new AppError(423, "Cuenta bloqueada temporalmente por intentos fallidos");
  }
};

const registerFailedAttempt = async (user) => {
  const next = user.failedLoginAttempts + 1;

  if (next >= env.MAX_LOGIN_ATTEMPTS) {
    const lockedUntil = new Date(Date.now() + env.LOCKOUT_MINUTES * 60 * 1000);
    await userRepository.update(user.id, {
      failedLoginAttempts: 0,
      lockedUntil,
    });
    throw new AppError(423, "Cuenta bloqueada temporalmente por intentos fallidos");
  }

  await userRepository.increaseFailedLogin(user.id, next);
};

const authService = {
  register: async ({ name, email, password }) => {
    const normalizedEmail = email.toLowerCase();
    const existing = await userRepository.findByEmail(normalizedEmail);

    if (existing) {
      throw new AppError(409, "El email ya se encuentra registrado");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userRepository.create({
      name,
      email: normalizedEmail,
      role: "usuario",
      passwordHash,
    });

    await auditService.create({
      userId: user.id,
      action: "user.register",
      meta: { role: user.role },
    });

    return createSession(user);
  },

  login: async ({ email, password }) => {
    const normalizedEmail = email.toLowerCase();
    const user = await userRepository.findByEmail(normalizedEmail);
    if (!user) throw new AppError(401, "Credenciales invalidas");

    assertUserNotLocked(user);

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      await registerFailedAttempt(user);
      throw new AppError(401, "Credenciales invalidas");
    }

    await userRepository.resetFailedLogin(user.id);
    await auditService.create({ userId: user.id, action: "user.login" });
    return createSession(user);
  },

  refreshSession: async ({ refreshToken }) => {
    const tokenHash = hashToken(refreshToken);
    const tokenRecord = await refreshTokenRepository.findValidByHash(tokenHash, new Date());
    if (!tokenRecord) throw new AppError(401, "Refresh token invalido o vencido");

    await refreshTokenRepository.revokeById(tokenRecord.id);
    return createSession(tokenRecord.user);
  },

  logout: async ({ refreshToken }) => {
    const tokenHash = hashToken(refreshToken);
    const tokenRecord = await refreshTokenRepository.findValidByHash(tokenHash, new Date());
    if (!tokenRecord) return { message: "Sesion cerrada" };

    await refreshTokenRepository.revokeById(tokenRecord.id);
    await auditService.create({ userId: tokenRecord.userId, action: "user.logout" });
    return { message: "Sesion cerrada" };
  },

  logoutAll: async ({ userId }) => {
    await refreshTokenRepository.revokeAllByUserId(userId);
    await auditService.create({ userId, action: "user.logout_all" });
    return { message: "Todas las sesiones cerradas" };
  },

  requestPasswordReset: async ({ email }) => {
    const normalizedEmail = email.toLowerCase();
    const user = await userRepository.findByEmail(normalizedEmail);
    if (!user) {
      return { message: "Si el email existe, enviaremos instrucciones" };
    }

    const resetToken = jwt.sign({ sub: user.id, type: "reset" }, env.JWT_SECRET, {
      expiresIn: "30m",
    });

    await emailService.sendPasswordReset({ to: user.email, resetToken });
    await auditService.create({ userId: user.id, action: "user.password_reset_requested" });

    return { message: "Reset solicitado", resetTokenPreview: resetToken };
  },

  setupAdmin: async ({ setupKey, name, email, password }) => {
    if (!env.SETUP_ADMIN_KEY) {
      throw new AppError(503, "Bootstrap admin deshabilitado en este entorno");
    }

    if (setupKey !== env.SETUP_ADMIN_KEY) {
      throw new AppError(403, "Setup key invalida");
    }

    const normalizedEmail = email.toLowerCase();
    const adminCount = await userRepository.countAdmins();
    const existingByEmail = await userRepository.findByEmail(normalizedEmail);

    if (adminCount > 0) {
      if (!existingByEmail || existingByEmail.role !== "admin") {
        throw new AppError(409, "Ya existe al menos un usuario admin con otro email");
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let user = existingByEmail;

    if (existingByEmail) {
      user = await userRepository.update(existingByEmail.id, {
        name,
        role: "admin",
        passwordHash,
      });
    } else {
      user = await userRepository.create({
        name,
        email: normalizedEmail,
        role: "admin",
        passwordHash,
      });
    }

    await auditService.create({
      userId: user.id,
      action: "admin.setup_bootstrap",
      meta: { email: user.email },
    });

    return createSession(user);
  },
};

module.exports = { authService };
