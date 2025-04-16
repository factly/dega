import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SpaceList from "./components/SpaceList";
import { RefreshCw, PlusCircle, Search as SearchIcon } from "lucide-react";
import Pagination from "../../components/Pagination";
import { getSpaces } from "../../actions/spaces";
import { spaceSelector } from "../../selectors/spaces";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
import { SpaceFilters, SpaceState, RootState, RoleState } from "./types";
import { useSpacesPagination } from "./hooks/useSpacesPagination";
import { AppThunkDispatch } from "../../store/types";
import Loader from "@/components/Loader";

const Spaces: React.FC = () => {
  const dispatch = useDispatch<AppThunkDispatch>();
  const location = useLocation();
  const { state: sidebarState } = useSidebar();
  const isMobile = useIsMobile();

  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState<boolean>(!isMobile);
  const [filters, setFilters] = useState<SpaceFilters>({
    page: 1,
    limit: isMobile ? 10 : 20,
  });

  const {
    spaces,
    loading,
    total = 0,
    hasAttemptedFetch = false,
  } = useSelector(spaceSelector) as SpaceState;

  // Pagination
  const { pageSize, totalPages, handlePageChange, handlePageSizeChange } =
    useSpacesPagination(filters, setFilters, total);

  // Handle responsive UI changes
  useEffect(() => {
    setShowSearch(!isMobile);
    setFilters((prev) => ({ ...prev, limit: isMobile ? 10 : 20 }));
  }, [isMobile]);

  useEffect(() => {
    // Only fetch spaces if we haven't attempted to fetch them yet
    if (!hasAttemptedFetch) {
      dispatch(getSpaces());
    }
  }, [dispatch, hasAttemptedFetch]);

  const { role } = useSelector((state: RootState): RoleState => {
    // Check if spaces exists in the state
    if (!state?.spaces) {
      return { role: "member" };
    }

    const { selected } = state.spaces;

    // Check if selected is truthy and not an empty string
    if (selected && selected !== "") {
      // Safely access details and the specific space
      const details = state.spaces.details || {};
      const space = details[selected];

      // Check if space exists and has org_role
      if (space && space.org_role) {
        return {
          role: space.org_role,
        };
      }
    }

    return { role: "member" };
  });

  // Toggle search on mobile
  const toggleSearch = useCallback(() => {
    setShowSearch((prev) => !prev);
    if (showSearch) {
      setSearchText("");
    }
  }, [showSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // You can add search functionality if needed here
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full relative">
        <Helmet title="Spaces" />
        {isMobile && (
          <MobileBreadcrumb currentPage="Spaces" parentLabel="Core" />
        )}
        <div className="flex-1 flex items-center justify-center">
          <Loader className="relative inset-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Helmet title={"Spaces"} />

      {/* Mobile Breadcrumb */}
      {isMobile && <MobileBreadcrumb currentPage="Spaces" parentLabel="Core" />}

      <div
        className={`${isMobile ? "sticky top-0" : "fixed"} z-10 bg-white`}
        style={
          !isMobile
            ? {
                left: sidebarState === "collapsed" ? "89px" : "265px",
                right: 0,
                transition: "left 0.3s ease",
              }
            : undefined
        }
      >
        <div
          className={`flex justify-between items-center ${
            isMobile ? "pb-3 pt-1" : "px-6 pt-1 h-full"
          }`}
        >
          {/* Title for mobile */}
          {isMobile && <h1 className="text-xl font-semibold">Spaces</h1>}

          {/* Desktop search bar */}
          {!isMobile && (
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-xs">
                <Input
                  placeholder="Search spaces..."
                  value={searchText}
                  onChange={handleSearchChange}
                  className="h-10"
                  disabled={spaces.length === 0}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div
            className={`${
              isMobile ? "flex items-center gap-2" : "flex space-x-4"
            }`}
          >
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

            {role === "admin" && !isMobile && (
              <Link to="/settings/advanced/reindex">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex items-center gap-2 py-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reindex
                </Button>
              </Link>
            )}

            <Link to="/spaces/create">
              {isMobile ? (
                <Button size="icon" className="h-9 w-9">
                  <PlusCircle className="h-5 w-5" />
                </Button>
              ) : (
                <Button size="lg" className="flex items-center gap-2 py-2">
                  <PlusCircle className="h-4 w-4" />
                  Create New Space
                </Button>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search bar */}
        {isMobile && showSearch && (
          <div className="px-4 pb-3">
            <form onSubmit={handleSearchSubmit}>
              <Input
                placeholder="Search spaces..."
                value={searchText}
                onChange={handleSearchChange}
                className="h-9 w-full"
                autoFocus
                disabled={spaces.length === 0}
              />
            </form>
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
        <SpaceList
          searchQuery={searchText}
          filters={filters}
          setFilters={setFilters}
          isMobile={isMobile}
        />
      </div>

      {spaces.length > 0 && (
        <div
          className={`${
            isMobile ? "fixed bottom-0 left-0 right-0 py-3" : "fixed bottom-0"
          } z-10 bg-white`}
          style={
            !isMobile
              ? {
                  left: sidebarState === "collapsed" ? "89px" : "265px",
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
            totalItems={total || 0}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isMobile={isMobile}
          />
        </div>
      )}
    </div>
  );
};

export default Spaces;
