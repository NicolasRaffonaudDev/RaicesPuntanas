const { loteRepository } = require("../repositories/lote-repository");

const loteController = {
  getAll: async (req, res) => {
    const data = await loteRepository.findAll();
    res.json(data);
  },
};

module.exports = { loteController };
