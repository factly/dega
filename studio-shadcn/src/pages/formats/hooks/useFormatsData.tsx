import { useMemo } from "react";
import { useSelector } from "react-redux";
import deepEqual from "deep-equal";
import { Format, FormatFilters, RootState } from "../types";

export const useFormatsData = (
  filters: FormatFilters,
  searchText: string,
  sortOrder: "asc" | "desc"
) => {
  // Get formats data from redux store
  const { formats, total, loading } = useSelector((state: RootState) => {
    const node = state.formats.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        formats: node.data.map((element) => state.formats.details[element]),
        total: node.total,
        loading: state.formats.loading,
      };
    return { formats: [], total: 0, loading: state.formats.loading };
  });

  // Filter and sort formats based on search text and sort order
  const filteredFormats = useMemo(() => {
    let filtered = formats;

    // Apply search filter
    if (searchText.trim()) {
      filtered = formats.filter(
        (format: Format) =>
          format.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          format.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply sorting
    return [...filtered].sort((a: Format, b: Format) => {
      if (sortOrder === "asc") {
        return (a.name || "").localeCompare(b.name || "");
      } else {
        return (b.name || "").localeCompare(a.name || "");
      }
    });
  }, [formats, searchText, sortOrder]);

  return {
    formats: filteredFormats,
    total,
    loading,
  };
};
