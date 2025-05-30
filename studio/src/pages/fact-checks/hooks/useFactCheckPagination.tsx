// hooks/useFactCheckPagination.ts
import { useCallback } from "react";
import { FilterValues } from "../types";

export const useFactCheckPagination = (
  filters: FilterValues,
  navigate: (to: { pathname: string; search: string }) => void,
  pathname: string,
  query: URLSearchParams,
  total: number
) => {
  const handlePageChange = useCallback((page: number) => {
    const newQuery = new URLSearchParams(query.toString());
    newQuery.set("page", page.toString());

    navigate({
      pathname,
      search: "?" + newQuery.toString(),
    });
  }, [navigate, pathname, query]);

  const handlePageSizeChange = useCallback((size: number) => {
    const newQuery = new URLSearchParams(query.toString());
    newQuery.set("limit", size.toString());
    newQuery.set("page", "1");

    navigate({
      pathname,
      search: "?" + newQuery.toString(),
    });
  }, [navigate, pathname, query]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(total / (filters.limit || 10)));

  return {
    handlePageChange,
    handlePageSizeChange,
    totalPages,
  };
};
