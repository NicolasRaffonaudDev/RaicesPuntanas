const { Router } = require("express");
const { telemetryController } = require("../controllers/telemetry-controller");
const { validateBody } = require("../middlewares/validate");
const { webVitalSchema } = require("../schemas/telemetry-schema");
const { asyncHandler } = require("../utils/async-handler");

const telemetryRoutes = Router();

telemetryRoutes.post("/web-vitals", validateBody(webVitalSchema), asyncHandler(telemetryController.ingestWebVital));

module.exports = { telemetryRoutes };
