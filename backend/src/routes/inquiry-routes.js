const { Router } = require("express");
const { inquiryController } = require("../controllers/inquiry-controller");
const { requireAuth } = require("../middlewares/auth");
const { validateBody } = require("../middlewares/validate");
const { inquiryCreateSchema } = require("../schemas/inquiry-schema");
const { asyncHandler } = require("../utils/async-handler");

const inquiryRoutes = Router();

inquiryRoutes.post("/", validateBody(inquiryCreateSchema), asyncHandler(inquiryController.create));
inquiryRoutes.get("/", requireAuth, asyncHandler(inquiryController.list));

module.exports = { inquiryRoutes };
