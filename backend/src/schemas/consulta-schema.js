const { z } = require("zod");

const consultaCreateSchema = z.object({
  loteId: z.number().int().positive().optional(),
  asunto: z.string().trim().min(3).max(120),
  mensaje: z.string().trim().min(10).max(2000),
});

const publicConsultaCreateSchema = z.object({
  loteId: z.number().int().positive(),
  nombreContacto: z.string().trim().min(2).max(120),
  emailContacto: z.string().trim().email().max(180),
  telefonoContacto: z.string().trim().min(6).max(40).optional(),
  mensaje: z.string().trim().min(10).max(2000),
});

const consultaUpdateSchema = z.object({
  estado: z.enum(["pendiente", "en_revision", "respondida", "cerrada"]),
});

const consultaSeguimientoCreateSchema = z.object({
  mensaje: z.string().trim().min(3).max(2000),
  esInterno: z.boolean().optional(),
});

module.exports = {
  consultaCreateSchema,
  publicConsultaCreateSchema,
  consultaUpdateSchema,
  consultaSeguimientoCreateSchema,
};
