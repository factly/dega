import { useCallback, useMemo } from "react";
import { ClaimantFilters } from "../types";

export const useClaimantsPagination = (
  filters: ClaimantFilters,
  setFilters: (
    filters: ClaimantFilters | ((prev: ClaimantFilters) => ClaimantFilters)
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
      setFilters((prev: ClaimantFilters) => ({ ...prev, page }));
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
