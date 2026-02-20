const { z } = require("zod");

const userRoleUpdateSchema = z.object({
  role: z.enum(["admin", "empleado", "usuario"]),
});

module.exports = { userRoleUpdateSchema };