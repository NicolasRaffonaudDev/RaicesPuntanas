const { inquiryService } = require("../services/inquiry-service");

const inquiryController = {
  create: async (req, res) => {
    const data = await inquiryService.create({ data: req.body });
    res.status(201).json({ data });
  },
};

module.exports = { inquiryController };
