import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Token, TokenFilters, RootState } from "../types";
import deepEqual from "deep-equal";

export const useTokensData = (filters: TokenFilters, searchText: string) => {
  // Get data from Redux
  const { tokens, total, loading } = useSelector((state: RootState) => {
    const node = state.tokens.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        tokens: node.data.map((element) => state.tokens.details[element]),
        total: node.total,
        loading: state.tokens.loading,
      };
    return { tokens: [], total: 0, loading: state.tokens.loading };
  });

  // Filter tokens locally based on search text
  const filteredTokens = useMemo(() => {
    if (!searchText.trim()) {
      return tokens as Token[];
    }

    return tokens.filter(
      (token) =>
        token.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        token.description?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [tokens, searchText]);

  return {
    tokens: filteredTokens,
    total,
    loading,
  };
};
