import { useMemo } from "react";
import { ClaimFilters } from "../types";

export const useClaimsPagination = (
  filters: ClaimFilters,
  setFilters: (filters: ClaimFilters) => void,
  total: number
) => {
  // Calculate total pages
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / filters.limit)),
    [total, filters.limit]
  );

  const handlePageChange = (page: number) => {
    setFilters({
      ...filters,
      page,
    });
  };

  const handlePageSizeChange = (limit: number) => {
    setFilters({
      ...filters,
      page: 1,
      limit,
    });
  };

  const onPagination = (page: number, limit: number) => {
    handlePageChange(page);
    if (limit !== filters.limit) {
      handlePageSizeChange(limit);
    }
  };

  return {
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    onPagination,
  };
};
