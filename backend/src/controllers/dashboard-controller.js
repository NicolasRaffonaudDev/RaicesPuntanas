const { dashboardService } = require("../services/dashboard-service");

const dashboardController = {
  me: async (req, res) => {
    const data = await dashboardService.getByRole({ role: req.auth.role, userId: req.auth.sub });
    res.json({ data });
  },
};

module.exports = { dashboardController };
