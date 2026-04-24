const toNumberOrFallback = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.trunc(parsed);
};

const getDefaultPage = (pageBase = 1) => (pageBase === 0 ? 0 : 1);

const getPagination = (page = 1, limit = 10, options = {}) => {
  const {
    defaultLimit = 10,
    maxLimit = 50,
    pageBase = 1,
  } = options;

  const minPage = getDefaultPage(pageBase);
  const safePage = Math.max(toNumberOrFallback(page, minPage), minPage);
  const safeLimit = Math.min(
    Math.max(toNumberOrFallback(limit, defaultLimit), 1),
    Math.max(maxLimit, 1)
  );

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - pageBase) * safeLimit,
    pageBase,
  };
};

const getPaginationFromQuery = (query = {}, options = {}) => {
  const pageBase = options.pageBase ?? 1;
  const defaultLimit = options.defaultLimit ?? 10;
  const pageFallback = getDefaultPage(pageBase);

  return getPagination(
    query.page ?? pageFallback,
    query.limit ?? defaultLimit,
    options
  );
};

const buildPaginationMeta = ({ total = 0, page = 1, limit = 10, pageBase = 1 }) => {
  const safeTotal = Math.max(Number(total) || 0, 0);
  const safeLimit = Math.max(Number(limit) || 1, 1);
  const totalPages = Math.max(1, Math.ceil(safeTotal / safeLimit));
  const currentPageIndex = pageBase === 0 ? page + 1 : page;

  return {
    total: safeTotal,
    page,
    limit: safeLimit,
    totalPages,
    hasNextPage: currentPageIndex < totalPages,
    hasPrevPage: currentPageIndex > 1,
  };
};

const buildPaginatedResponse = ({
  items = [],
  total = 0,
  page = 1,
  limit = 10,
  pageBase = 1,
  itemKey = "items",
}) => {
  const meta = buildPaginationMeta({ total, page, limit, pageBase });

  return {
    [itemKey]: items,
    ...meta,
  };
};

const paginateArray = (items = [], pagination = {}) => {
  const safeItems = Array.isArray(items) ? items : [];
  const pageBase = pagination.pageBase ?? 1;
  const page = pagination.page ?? getDefaultPage(pageBase);
  const limit = pagination.limit ?? 10;
  const skip =
    typeof pagination.skip === "number"
      ? pagination.skip
      : (page - pageBase) * limit;

  return safeItems.slice(skip, skip + limit);
};

module.exports = {
  buildPaginatedResponse,
  buildPaginationMeta,
  getPagination,
  getPaginationFromQuery,
  paginateArray,
};