import { useMemo, useCallback } from "react";
import { SpaceFilters } from "../types";

export const useSpacesPagination = (
  filters: SpaceFilters,
  setFilters: (
    filters: SpaceFilters | ((prev: SpaceFilters) => SpaceFilters)
  ) => void,
  total: number | null
) => {
  // Calculate total pages
  const pageSize = filters.limit || 20;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((total || 0) / pageSize)),
    [total, pageSize]
  );

  // Pagination handlers
  const handlePageChange = useCallback(
    (page: number) => {
      setFilters((prev: SpaceFilters) => ({ ...prev, page }));
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
