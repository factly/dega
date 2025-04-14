import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Claimant, ClaimantFilters, RootState } from "../types";
import deepEqual from "deep-equal";

export const useClaimantsData = (
  filters: ClaimantFilters,
  searchText: string,
  sortOrder: "asc" | "desc" = "asc"
) => {
  // Get data from Redux
  const { claimants, total, loading } = useSelector((state: RootState) => {
    const node = state.claimants.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        claimants: node.data.map((element) => state.claimants.details[element]),
        total: node.total,
        loading: state.claimants.loading,
      };
    return { claimants: [], total: 0, loading: state.claimants.loading };
  });

  // Filter and sort claimants locally based on search text and sort order
  const filteredClaimants = useMemo(() => {
    let filtered = claimants as Claimant[];

    // Apply search filter
    if (searchText.trim()) {
      filtered = claimants.filter(
        (claimant) =>
          claimant.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          claimant.tag_line?.toLowerCase().includes(searchText.toLowerCase())
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
  }, [claimants, searchText, sortOrder]);

  return {
    claimants: filteredClaimants,
    total,
    loading,
  };
};
