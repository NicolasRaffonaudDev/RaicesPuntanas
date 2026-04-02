const { prisma } = require("../db/prisma");

const inquiryInclude = {
  lote: {
    select: {
      id: true,
      title: true,
      address: true,
    },
  },
};

const inquiryRepository = {
  create: (data) =>
    prisma.inquiry.create({
      data,
      include: inquiryInclude,
    }),

  findPaged: ({ skip, take }) =>
    prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: inquiryInclude,
    }),

  count: () => prisma.inquiry.count(),
};

module.exports = { inquiryRepository };
