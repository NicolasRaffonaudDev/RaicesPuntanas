const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AppError } = require("../utils/app-error");
const { userRepository } = require("../repositories/user-repository");
const { env } = require("../config/env");
const { auditService } = require("./audit-service");
const { emailService } = require("./email-service");

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

const createToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );

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

    return { token: createToken(user), user: sanitizeUser(user) };
  },

  login: async ({ email, password }) => {
    const normalizedEmail = email.toLowerCase();
    const user = await userRepository.findByEmail(normalizedEmail);
    if (!user) throw new AppError(401, "Credenciales invalidas");

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new AppError(401, "Credenciales invalidas");

    await auditService.create({ userId: user.id, action: "user.login" });
    return { token: createToken(user), user: sanitizeUser(user) };
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

    return { token: createToken(user), user: sanitizeUser(user) };
  },
};

module.exports = { authService };
