import { useCallback, useMemo } from "react";
import { FormatFilters } from "../types";

export const useFormatsPagination = (
  filters: FormatFilters,
  setFilters: (filters: Partial<FormatFilters>) => void,
  total: number
) => {
  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / filters.limit));
  }, [total, filters.limit]);

  // Current page size
  const pageSize = filters.limit;

  // Page change handler
  const handlePageChange = useCallback(
    (page: number) => {
      setFilters({ page });
    },
    [setFilters]
  );

  // Page size change handler
  const handlePageSizeChange = useCallback(
    (size: number) => {
      setFilters({ page: 1, limit: size });
    },
    [setFilters]
  );

  return {
    pageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
  };
};
