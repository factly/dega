import { useMemo } from "react";
import { useSelector } from "react-redux";
import deepEqual from "deep-equal";
import { Format, FormatFilters, RootState } from "../types";

export const useFormatsData = (filters: FormatFilters, searchText: string) => {
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

  // Filter formats based on search text
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

    return filtered;
  }, [formats, searchText]);

  return {
    formats: filteredFormats,
    total,
    loading,
  };
};
