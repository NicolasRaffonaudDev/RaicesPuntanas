const { z } = require("zod");

const isValidImageReference = (value) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/uploads/")) return true;
  return z.string().url().safeParse(trimmed).success;
};

const imageFieldSchema = z
  .string()
  .trim()
  .min(1)
  .refine(isValidImageReference, "La imagen debe ser una URL valida o un archivo local subido");

const loteCreateSchema = z.object({
  title: z.string().trim().min(2).max(160),
  price: z.number().int().positive(),
  size: z.number().int().positive(),
  destacado: z.boolean().optional(),
  amenities: z.array(z.string().uuid()).max(20).default([]),
  image: imageFieldSchema,
  address: z.string().trim().max(240).optional().nullable(),
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
  description: z.string().trim().max(1200).optional().nullable(),
  uploadedImages: z.array(imageFieldSchema).max(12).optional(),
});

const loteUpdateSchema = z
  .object({
    title: z.string().trim().min(2).max(160).optional(),
    price: z.number().int().positive().optional(),
    size: z.number().int().positive().optional(),
    destacado: z.boolean().optional(),
    amenities: z.array(z.string().uuid()).max(20).optional(),
    image: imageFieldSchema.optional(),
    address: z.string().trim().max(240).optional().nullable(),
    lat: z.number().finite().min(-90).max(90).optional(),
    lng: z.number().finite().min(-180).max(180).optional(),
    description: z.string().trim().max(1200).optional().nullable(),
    uploadedImages: z.array(imageFieldSchema).max(12).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "Debes enviar al menos un campo a actualizar");

module.exports = { loteCreateSchema, loteUpdateSchema };
