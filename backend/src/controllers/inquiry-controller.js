const { inquiryService } = require("../services/inquiry-service");

const { parsePagination } = require("../utils/query");

const inquiryController = {
  create: async (req, res) => {
    const data = await inquiryService.create({ data: req.body });
    res.status(201).json({ data });
  },

  list: async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const status = typeof req.query.status === "string" ? req.query.status : undefined;

    if (status && !["pending", "read"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await inquiryService.list({ page, limit, skip, status });
    res.json(result);
  },

  updateStatus: async (req, res) => {
    const data = await inquiryService.updateStatus({
      id: req.params.id,
      status: req.body.status,
    });
    res.json({ data });
  },
};

module.exports = { inquiryController };
