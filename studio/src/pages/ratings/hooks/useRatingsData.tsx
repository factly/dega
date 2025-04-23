import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Rating, RatingFilters, RootState } from "../types";
import deepEqual from "deep-equal";

export const useRatingsData = (
  filters: RatingFilters,
  searchText: string,
  sortOrder: "asc" | "desc" = "asc"
) => {
  // Get data from Redux
  const { ratings, total, loading } = useSelector((state: RootState) => {
    const node = state.ratings.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        ratings: node.data.map((element) => state.ratings.details[element]),
        total: node.total,
        loading: state.ratings.loading,
      };
    return { ratings: [], total: 0, loading: state.ratings.loading };
  });

  // Filter and sort ratings based on search text and sort order
  const filteredRatings = useMemo(() => {
    let filtered = ratings as Rating[];

    // Apply search filter
    if (searchText.trim()) {
      filtered = ratings.filter((rating) =>
        rating.name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name?.localeCompare(b.name || "") || 0;
      } else {
        return b.name?.localeCompare(a.name || "") || 0;
      }
    });
  }, [ratings, searchText, sortOrder]);

  return {
    ratings: filteredRatings,
    total,
    loading,
  };
};
