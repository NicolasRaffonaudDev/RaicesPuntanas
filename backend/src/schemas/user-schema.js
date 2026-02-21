const { z } = require("zod");

const userRoleUpdateSchema = z.object({
  role: z.enum(["admin", "empleado", "usuario"]),
});

const userCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  role: z.enum(["admin", "empleado", "usuario"]),
});

module.exports = { userRoleUpdateSchema, userCreateSchema };