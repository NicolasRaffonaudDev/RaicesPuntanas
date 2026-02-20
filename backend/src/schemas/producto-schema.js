const { z } = require("zod");

const productoCreateSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  sku: z.string().trim().min(3).max(40),
  precio: z.number().int().positive(),
  stock: z.number().int().min(0).optional().default(0),
  activo: z.boolean().optional().default(true),
});

const productoUpdateSchema = z
  .object({
    nombre: z.string().trim().min(2).max(120).optional(),
    precio: z.number().int().positive().optional(),
    stock: z.number().int().min(0).optional(),
    activo: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "Debes enviar al menos un campo a actualizar");

module.exports = { productoCreateSchema, productoUpdateSchema };