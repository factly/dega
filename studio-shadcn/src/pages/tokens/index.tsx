import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TokenList from "./components/TokenList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { getSpaceTokens } from "../../actions/tokens";
import deepEqual from "deep-equal";
import Pagination from "../../components/Pagination";
import { useAppDispatch } from "@/hooks/reduxHooks";

interface TokensState {
  details: Record<string, any>;
  loading: boolean;
  req: {
    data: string[];
    query: Record<string, any>;
    total: number;
  }[];
}

interface RootState {
  tokens: TokensState;
  sidebar: {
    collapsed: boolean;
  };
}

const Tokens: React.FC = () => {
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });

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

  useEffect(() => {
    fetchTokens();
  }, [filters]);

  // Fetch tokens function
  const fetchTokens = () => {
    dispatch(getSpaceTokens(filters));
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: number) => {
    setFilters({ page: 1, limit: size });
  };

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  // Get sidebar state from Redux store
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.collapsed
  );

  // Calculate left margin based on sidebar state
  const sidebarWidth = isCollapsed ? "89px" : "265px";

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="flex justify-end mb-5">
        <Link to="/settings/advanced/tokens/create">
          <Button variant="default" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Generate new tokens
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div
        className="overflow-auto"
        style={{
          paddingBottom: "64px", // Make room for the pagination at the bottom
        }}
      >
        <TokenList
          tokens={tokens}
          total={total}
          loading={loading}
          filters={filters}
          fetchTokens={fetchTokens}
        />
      </div>

      {/* Footer with Pagination */}
      <div
        className="fixed bottom-0 z-10 bg-white"
        style={{
          left: sidebarWidth,
          right: 0,
          height: "64px",
          transition: "left 0.3s ease",
        }}
      >
        <Pagination
          currentPage={filters.page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={filters.limit}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
};

export default Tokens;
