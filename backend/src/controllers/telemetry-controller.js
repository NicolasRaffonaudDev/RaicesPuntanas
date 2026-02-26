const { telemetryService } = require("../services/telemetry-service");

const telemetryController = {
  ingestWebVital: async (req, res) => {
    await telemetryService.ingestWebVital({ payload: req.body });
    res.status(202).json({ ok: true });
  },
};

module.exports = { telemetryController };
