const { auditService } = require("../services/audit-service");
const { parseDateRange, parsePagination } = require("../utils/query");

const auditController = {
  list: async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const { from, to } = parseDateRange(req.query);

    const search = req.query.search ? String(req.query.search).trim() : "";
    const action = req.query.action ? String(req.query.action).trim() : "";
    const userId = req.query.userId ? String(req.query.userId).trim() : "";

    const result = await auditService.list({
      page,
      limit,
      skip,
      search,
      action,
      userId,
      from,
      to,
    });

    res.json(result);
  },
};

module.exports = { auditController };
