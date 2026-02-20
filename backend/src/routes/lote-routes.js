const { Router } = require("express");
const { loteController } = require("../controllers/lote-controller");
const { asyncHandler } = require("../utils/async-handler");

const loteRoutes = Router();

loteRoutes.get("/", asyncHandler(loteController.getAll));

module.exports = { loteRoutes };
