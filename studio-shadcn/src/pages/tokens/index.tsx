import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TokenList from "./components/TokenList";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search as SearchIcon } from "lucide-react";
import { useSelector } from "react-redux";
import { getSpaceTokens } from "../../actions/tokens";
import deepEqual from "deep-equal";
import Pagination from "../../components/Pagination";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";

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
  const isMobile = useIsMobile();
  const [searchText, setSearchText] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(!isMobile);

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

  // Filter tokens locally based on search text
  const filteredTokens = searchText.trim()
    ? tokens.filter(
        (token) =>
          token.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          token.description?.toLowerCase().includes(searchText.toLowerCase())
      )
    : tokens;

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

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Toggle search on mobile
  const toggleSearch = () => {
    setShowSearch((prev) => !prev);
    if (showSearch) {
      setSearchText("");
    }
  };

  // Get sidebar state from Redux store
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.collapsed
  );

  // Calculate left margin based on sidebar state
  const sidebarWidth = isCollapsed ? "89px" : "265px";

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Breadcrumb */}
      {isMobile && (
        <MobileBreadcrumb
          currentPage="API Tokens"
          parentPath="/settings/advanced"
          parentLabel="Advanced Settings"
        />
      )}

      <div
        className={`${isMobile ? "sticky top-0" : "fixed"} z-10 bg-white`}
        style={
          !isMobile
            ? {
                left: sidebarWidth,
                right: 0,
                transition: "left 0.3s ease",
              }
            : undefined
        }
      >
        <div
          className={`flex justify-between items-center ${
            isMobile ? "pb-3 pt-1" : "px-3 pt-1 h-full"
          }`}
        >
          {/* Title */}
          {isMobile && <h1 className="text-xl font-semibold">API Tokens</h1>}

          {/* Desktop search bar */}
          {!isMobile && (
            <div className="flex-1 max-w-xs">
              <Input
                placeholder="Search tokens..."
                value={searchText}
                onChange={handleSearchChange}
                className="h-10"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className={`${isMobile ? "flex items-center gap-2" : ""}`}>
            {isMobile && (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSearch}
                className="h-9 w-9 text-gray-500"
              >
                <SearchIcon className="h-5 w-5" />
              </Button>
            )}

            <Link to="/settings/advanced/tokens/create">
              {isMobile ? (
                <Button size="icon" className="h-9 w-9">
                  <PlusCircle className="h-5 w-5" />
                </Button>
              ) : (
                <Button variant="default" className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Generate new tokens
                </Button>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search bar */}
        {isMobile && showSearch && (
          <div className="px-4 pb-3">
            <Input
              placeholder="Search tokens..."
              value={searchText}
              onChange={handleSearchChange}
              className="h-9 w-full"
              autoFocus
            />
          </div>
        )}
      </div>

      <div
        className={
          isMobile
            ? "flex-1 pb-16 pt-1 overflow-auto"
            : "absolute overflow-auto"
        }
        style={
          !isMobile
            ? {
                top: "calc(1.5rem + 2.5rem + 1rem)",
                left: sidebarWidth,
                right: 0,
                bottom: "64px",
                paddingLeft: "1.5rem",
                paddingRight: "1.5rem",
                paddingBottom: "1.5rem",
                paddingTop: "1rem",
                transition: "left 0.3s ease",
              }
            : undefined
        }
      >
        <TokenList
          tokens={filteredTokens}
          total={total}
          loading={loading}
          filters={filters}
          fetchTokens={fetchTokens}
          isMobile={isMobile}
        />
      </div>

      <div
        className={`${
          isMobile ? "fixed bottom-0 left-0 right-0 py-3" : "fixed bottom-0"
        } z-10 bg-white`}
        style={
          !isMobile
            ? {
                left: sidebarWidth,
                right: 0,
                height: "64px",
                transition: "left 0.3s ease",
              }
            : undefined
        }
      >
        <Pagination
          currentPage={filters.page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={filters.limit}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};

export default Tokens;
