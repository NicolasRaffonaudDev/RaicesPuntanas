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

  findPaged: ({ skip, take, status }) =>
    prisma.inquiry.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: inquiryInclude,
    }),

  count: (status) => prisma.inquiry.count({ where: status ? { status } : undefined }),

  getStats: async () => {
    const [total, pending, read] = await Promise.all([
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: "pending" } }),
      prisma.inquiry.count({ where: { status: "read" } }),
    ]);
    return { total, pending, read };
  },

  updateStatus: (id, status) =>
    prisma.inquiry.update({
      where: { id },
      data: { status },
      include: inquiryInclude,
    }),
};

module.exports = { inquiryRepository };
