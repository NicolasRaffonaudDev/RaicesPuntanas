const { z } = require("zod");

const loteCreateSchema = z.object({
  title: z.string().trim().min(2).max(160),
  price: z.number().int().positive(),
  size: z.number().int().positive(),
  amenities: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  image: z.string().trim().url(),
  address: z.string().trim().max(240).optional().nullable(),
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
  description: z.string().trim().max(1200).optional().nullable(),
});

const loteUpdateSchema = z
  .object({
    title: z.string().trim().min(2).max(160).optional(),
    price: z.number().int().positive().optional(),
    size: z.number().int().positive().optional(),
    amenities: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
    image: z.string().trim().url().optional(),
    address: z.string().trim().max(240).optional().nullable(),
    lat: z.number().finite().min(-90).max(90).optional(),
    lng: z.number().finite().min(-180).max(180).optional(),
    description: z.string().trim().max(1200).optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, "Debes enviar al menos un campo a actualizar");

module.exports = { loteCreateSchema, loteUpdateSchema };
