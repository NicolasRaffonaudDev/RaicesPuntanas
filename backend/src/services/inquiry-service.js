const { AppError } = require("../utils/app-error");
const { inquiryRepository } = require("../repositories/inquiry-repository");
const { loteRepository } = require("../repositories/lote-repository");

const inquiryService = {
  create: async ({ data }) => {
    const lote = await loteRepository.findById(data.loteId);
    if (!lote) throw new AppError(404, "Lote no encontrado");

    const inquiry = await inquiryRepository.create({
      name: data.name,
      email: data.email,
      message: data.message,
      loteId: data.loteId,
    });

    // Optional log for verification
    console.log("[inquiry] Nueva consulta", {
      id: inquiry.id,
      loteId: inquiry.loteId,
      email: inquiry.email,
    });

    return inquiry;
  },
};

module.exports = { inquiryService };
