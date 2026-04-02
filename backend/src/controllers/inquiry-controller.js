const { inquiryService } = require("../services/inquiry-service");

const { parsePagination } = require("../utils/query");

const inquiryController = {
  create: async (req, res) => {
    const data = await inquiryService.create({ data: req.body });
    res.status(201).json({ data });
  },

  list: async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const result = await inquiryService.list({ page, limit, skip });
    res.json(result);
  },
};

module.exports = { inquiryController };
