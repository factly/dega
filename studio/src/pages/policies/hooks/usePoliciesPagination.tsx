import { useCallback, useMemo } from "react";
import { PolicyFilters } from "../types";

export const usePoliciesPagination = (
  filters: PolicyFilters,
  setFilters: (
    filters: PolicyFilters | ((prev: PolicyFilters) => PolicyFilters)
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
      setFilters((prev: PolicyFilters) => ({ ...prev, page }));
    },
    [setFilters]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setFilters((prev: PolicyFilters) => ({ ...prev, limit: size, page: 1 }));
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
