// hooks/usePagination.ts
export const usePagination = (
  filters: FilterParams,
  setFilters: (filters: FilterParams) => void,
  total: number,
  navigate: any,
  pathname: string,
  query: URLSearchParams
) => {
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);

    const newQuery = new URLSearchParams(query.toString());
    newQuery.set("page", page.toString());

    navigate({
      pathname,
      search: "?" + newQuery.toString(),
    });
  };

  const handlePageSizeChange = (size: number) => {
    const newFilters = { ...filters, page: 1, limit: size };
    setFilters(newFilters);

    const newQuery = new URLSearchParams(query.toString());
    newQuery.set("limit", size.toString());
    newQuery.set("page", "1");

    navigate({
      pathname,
      search: "?" + newQuery.toString(),
    });
  };

  // Calculate total pages
  const totalPages = Math.max(
    1,
    Math.ceil(total / Number(filters.limit || 10))
  );

  // Legacy pagination function (kept for compatibility with PageList)
  function onPagination(page: number, limit: number) {
    handlePageChange(page);
    if (limit !== Number(filters.limit)) {
      handlePageSizeChange(limit);
    }
  }

  return {
    handlePageChange,
    handlePageSizeChange,
    totalPages,
    onPagination
  };
};
