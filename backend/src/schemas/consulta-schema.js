const { z } = require("zod");

const consultaCreateSchema = z.object({
  loteId: z.number().int().positive().optional(),
  asunto: z.string().trim().min(3).max(120),
  mensaje: z.string().trim().min(10).max(2000),
});

const consultaUpdateSchema = z.object({
  estado: z.enum(["pendiente", "en_revision", "respondida", "cerrada"]),
});

const consultaSeguimientoCreateSchema = z.object({
  mensaje: z.string().trim().min(3).max(2000),
  esInterno: z.boolean().optional(),
});

module.exports = { consultaCreateSchema, consultaUpdateSchema, consultaSeguimientoCreateSchema };
