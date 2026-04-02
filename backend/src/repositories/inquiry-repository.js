const { prisma } = require("../db/prisma");

const inquiryRepository = {
  create: (data) =>
    prisma.inquiry.create({
      data,
      include: {
        lote: true,
      },
    }),
};

module.exports = { inquiryRepository };
