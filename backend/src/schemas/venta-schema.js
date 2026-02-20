const { z } = require("zod");

const ventaCreateSchema = z.object({
  clienteId: z.string().cuid().optional(),
  items: z
    .array(
      z.object({
        productoId: z.number().int().positive(),
        cantidad: z.number().int().positive(),
      }),
    )
    .min(1),
});

module.exports = { ventaCreateSchema };