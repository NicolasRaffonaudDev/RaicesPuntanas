const { z } = require("zod");

const inventarioMovimientoSchema = z.object({
  productoId: z.number().int().positive(),
  tipo: z.enum(["entrada", "salida", "ajuste"]),
  cantidad: z.number().int().positive(),
  motivo: z.string().trim().max(200).optional(),
});

module.exports = { inventarioMovimientoSchema };