import { useCallback, useMemo } from "react";
import { RatingFilters } from "../types";

export const useRatingsPagination = (
  filters: RatingFilters,
  setFilters: (
    filters: RatingFilters | ((prev: RatingFilters) => RatingFilters)
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
      setFilters((prev: RatingFilters) => ({ ...prev, page }));
    },
    [setFilters]
  );

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
