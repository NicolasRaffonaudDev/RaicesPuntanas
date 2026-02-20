const toInt = (value, fallback) => {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return fallback;
  return n;
};

const parsePagination = (query) => {
  const page = toInt(query.page, 1);
  const limit = Math.min(toInt(query.limit, 20), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const parseDateRange = (query) => {
  const from = query.from ? new Date(String(query.from)) : null;
  const to = query.to ? new Date(String(query.to)) : null;

  const isValidDate = (date) => date instanceof Date && !Number.isNaN(date.valueOf());

  return {
    from: isValidDate(from) ? from : null,
    to: isValidDate(to) ? to : null,
  };
};

module.exports = { parsePagination, parseDateRange };
