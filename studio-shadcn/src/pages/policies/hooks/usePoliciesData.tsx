import { useMemo } from "react";
import { useSelector } from "react-redux";
import { PolicyFilters, RootState } from "../types";
import deepEqual from "deep-equal";

export const usePoliciesData = (
  filters: PolicyFilters,
  searchText: string,
  sortOrder: "asc" | "desc" = "asc"
) => {
  // Get data from Redux
  const { policies, total, loading } = useSelector((state: RootState) => {
    const node = state.policies.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node) {
      return {
        policies: node.data.map((element) => state.policies.details[element]),
        total: node.total,
        loading: state.policies.loading,
      };
    }

    return { policies: [], total: 0, loading: state.policies.loading };
  });

  // Filter policies locally based on search text
  const filteredPolicies = useMemo(() => {
    if (!searchText.trim()) {
      return policies;
    }

    return policies.filter((policy) =>
      policy.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [policies, searchText]);

  // Sort policies based on sort order
  const sortedPolicies = useMemo(() => {
    return [...filteredPolicies].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name?.localeCompare(b.name || "") || 0;
      } else {
        return b.name?.localeCompare(a.name || "") || 0;
      }
    });
  }, [filteredPolicies, sortOrder]);

  return {
    policies: sortedPolicies,
    total,
    loading,
  };
};
