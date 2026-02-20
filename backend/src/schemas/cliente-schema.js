const { z } = require("zod");

const clienteCreateSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  email: z.string().trim().email().optional(),
  telefono: z.string().trim().max(40).optional(),
  direccion: z.string().trim().max(200).optional(),
});

const clienteUpdateSchema = clienteCreateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "Debes enviar al menos un campo a actualizar",
);

module.exports = { clienteCreateSchema, clienteUpdateSchema };