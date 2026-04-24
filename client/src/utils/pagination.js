export const getPageCount = (total = 0, limit = 10) => {
  const safeTotal = Math.max(Number(total) || 0, 0);
  const safeLimit = Math.max(Number(limit) || 1, 1);
  return Math.max(1, Math.ceil(safeTotal / safeLimit));
};

export const normalizePaginatedPayload = (payload = {}, itemKey = "items") => {
  const items = Array.isArray(payload?.[itemKey]) ? payload[itemKey] : [];
  const total = Number(payload?.total) || 0;
  const page = Number(payload?.page) || 0;
  const limit = Number(payload?.limit) || 10;

  return {
    items,
    total,
    page,
    limit,
    totalPages: Number(payload?.totalPages) || getPageCount(total, limit),
    hasNextPage: Boolean(payload?.hasNextPage),
    hasPrevPage: Boolean(payload?.hasPrevPage),
  };
};
