const { z } = require("zod");

const webVitalSchema = z.object({
  name: z.enum(["CLS", "INP", "LCP", "FCP", "TTFB"]),
  id: z.string().trim().min(1).max(120),
  value: z.number().finite().nonnegative(),
  rating: z.enum(["good", "needs-improvement", "poor"]),
  delta: z.number().finite().optional(),
  navigationType: z.string().trim().max(80).optional(),
  path: z.string().trim().max(250).optional(),
});

module.exports = { webVitalSchema };
