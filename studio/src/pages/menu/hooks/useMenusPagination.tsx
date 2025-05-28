import { useCallback, useMemo } from "react";
import { MenuFilters } from "../types";

export const useMenusPagination = (
  filters: MenuFilters,
  setFilters: (
    filters: MenuFilters | ((prev: MenuFilters) => MenuFilters)
  ) => void,
  total: number
) => {
  // Calculate total pages
  const pageSize = filters.limit || 10;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  // Pagination handlers
  const handlePageChange = useCallback(
    (page: number) => {
      setFilters((prev: MenuFilters) => ({ ...prev, page }));
    },
    [setFilters]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setFilters({ ...filters, limit: size, page: 1 });
    },
    [setFilters, filters]
  );

  return {
    pageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
  };
};
