// hooks/useTagsPagination.tsx
import { useMemo } from "react";
import { TagFilters } from "../types";

export const useTagsPagination = (
  filters: TagFilters,
  setFilters: (filters: TagFilters) => void,
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
