import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import TokenList from "./components/TokenList";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search as SearchIcon } from "lucide-react";
import { getSpaceTokens } from "../../actions/tokens";
import Pagination from "../../components/Pagination";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
import { Helmet } from "react-helmet";
import { useSidebar } from "@/components/ui/sidebar";
import { TokenFilters } from "./types";
import { useTokensData } from "./hooks/useTokensData";
import { useTokensPagination } from "./hooks/useTokensPagination";
import SecuredButton from "@/components/SecuredButton";

const Tokens: React.FC = () => {
  const dispatch = useAppDispatch();
  const { state: sidebarState } = useSidebar();
  const isMobile = useIsMobile();

  // State for search and filters
  const [searchText, setSearchText] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(!isMobile);
  const [filters, setFilters] = useState<TokenFilters>({
    page: 1,
    limit: 10,
  });

  // Handle responsive UI changes
  useEffect(() => {
    setShowSearch(!isMobile);
  }, [isMobile]);

  // Use custom hooks for data and pagination
  const { tokens, total, loading } = useTokensData(filters, searchText);
  const { pageSize, totalPages, handlePageChange, handlePageSizeChange } =
    useTokensPagination(filters, setFilters, total);

  // Fetch tokens when filters change
  useEffect(() => {
    fetchTokens();
  }, [filters]);

  // Fetch tokens function for the list component
  const fetchTokens = useCallback(() => {
    dispatch(getSpaceTokens(filters));
  }, [dispatch, filters]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Toggle search on mobile
  const toggleSearch = useCallback(() => {
    setShowSearch((prev) => !prev);
    if (showSearch) {
      setSearchText("");
    }
  }, [showSearch]);

  // Handle navigation to create token page
  const handleCreateToken = () => {
    window.location.href = "/settings/advanced/tokens/create";
  };

  // Get sidebar state
  const isCollapsed = sidebarState === "collapsed" && !isMobile;

  return (
    <div className="flex flex-col h-full">
      <Helmet title={"API Tokens"} />

      {/* Mobile Breadcrumb */}
      {isMobile && (
        <MobileBreadcrumb
          currentPage="API Tokens"
          parentLabel="Advanced Settings"
        />
      )}

      <div
        className={`${isMobile ? "sticky top-0" : "fixed"} z-10 bg-white`}
        style={
          !isMobile
            ? {
                left: isCollapsed ? "89px" : "265px",
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

            {isMobile ? (
              <SecuredButton
                size="icon"
                className="h-9 w-9"
                onClick={handleCreateToken}
              >
                <PlusCircle className="h-5 w-5" />
              </SecuredButton>
            ) : (
              <SecuredButton
                variant="default"
                className="flex items-center gap-2"
                onClick={handleCreateToken}
              >
                <PlusCircle className="h-4 w-4" />
                Generate New token
              </SecuredButton>
            )}
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
                left: 0,
                right: 0,
                bottom: "64px",
                paddingLeft: "1.5rem",
                paddingRight: "1.5rem",
                paddingBottom: "1.5rem",
                paddingTop: "1rem",
                transition: "left 0.3s ease, top 0.3s ease",
              }
            : undefined
        }
      >
        <TokenList
          data={{
            tokens,
            total,
            loading,
          }}
          filters={filters}
          setFilters={setFilters}
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
                left: isCollapsed ? "89px" : "265px",
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
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};

export default Tokens;
