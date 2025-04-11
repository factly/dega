import { useMemo } from "react";
import { useSelector } from "react-redux";
import deepEqual from "deep-equal";
import { ClaimFilters, ClaimListData } from "../types";

export const useClaimsData = (
  filters: ClaimFilters,
  searchText: string
): ClaimListData => {
  const { claims, total, loading } = useSelector((state: any) => {
    const node = state.claims.req.find((item: any) => {
      return deepEqual(item.query, filters);
    });

    if (node) {
      const list = node.data.map((element: string) => {
        const originalClaim = state.claims.details[element];
        return {
          ...originalClaim,
          claimant:
            state.claimants.details[originalClaim.claimant_id]?.name || "",
          rating: state.ratings.details[originalClaim.rating_id]?.name || "",
        };
      });

      return {
        claims: list,
        total: node.total,
        loading: state.claims.loading,
      };
    }
    return { claims: [], total: 0, loading: state.claims.loading };
  });

  // Filter and sort claims based on parameters
  const sortedClaims = useMemo(() => {
    if (!claims) return [];
    const sortableClaims = [...claims];
    return sortableClaims.sort((a, b) => {
      if (filters.sortBy === "claim") {
        // Sort alphabetically by claim text
        const aText = a.claim || "";
        const bText = b.claim || "";
        const comparison = aText.localeCompare(bText);
        return filters.sort === "asc" ? comparison : -comparison;
      } else {
        // Sort by claim date (default)
        const dateA = new Date(a.claim_date || "").getTime();
        const dateB = new Date(b.claim_date || "").getTime();
        return filters.sort === "asc"
          ? dateA - dateB // Oldest first
          : dateB - dateA; // Newest first
      }
    });
  }, [claims, filters.sort, filters.sortBy]);

  const filteredClaims = useMemo(() => {
    if (!searchText.trim()) {
      return sortedClaims;
    }

    return sortedClaims.filter(
      (claim) =>
        claim.claim?.toLowerCase().includes(searchText.toLowerCase()) ||
        claim.claimant?.toLowerCase().includes(searchText.toLowerCase()) ||
        claim.rating?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [sortedClaims, searchText]);

  return {
    claims: filteredClaims,
    total: total,
    loading: loading,
  };
};
