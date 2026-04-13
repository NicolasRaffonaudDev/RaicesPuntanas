const { Router } = require("express");
const { inquiryController } = require("../controllers/inquiry-controller");
const { requireAuth } = require("../middlewares/auth");
const { validateBody } = require("../middlewares/validate");
const { inquiryCreateSchema, inquiryStatusSchema } = require("../schemas/inquiry-schema");
const { asyncHandler } = require("../utils/async-handler");

const inquiryRoutes = Router();

inquiryRoutes.post("/", validateBody(inquiryCreateSchema), asyncHandler(inquiryController.create));
inquiryRoutes.get("/stats", requireAuth, asyncHandler(inquiryController.getStats));
inquiryRoutes.get("/", requireAuth, asyncHandler(inquiryController.list));
inquiryRoutes.patch(
  "/:id/status",
  requireAuth,
  validateBody(inquiryStatusSchema),
  asyncHandler(inquiryController.updateStatus),
);

module.exports = { inquiryRoutes };
