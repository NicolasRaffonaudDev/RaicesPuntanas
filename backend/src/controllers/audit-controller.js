const { auditService } = require("../services/audit-service");

const auditController = {
  list: async (req, res) => {
    const data = await auditService.getRecent(200);
    res.json({ data });
  },
};

module.exports = { auditController };
