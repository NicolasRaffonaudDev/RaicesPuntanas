const { z } = require("zod");

const inquiryCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  message: z.string().trim().min(10).max(2000),
  loteId: z.number().int().positive(),
});

module.exports = { inquiryCreateSchema };
