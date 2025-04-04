import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SpaceList from "./components/SpaceList";
import {
  RefreshCw,
  PlusCircle,
  FolderPlus,
  Search as SearchIcon,
} from "lucide-react";
import Pagination from "../../components/Pagination";
import { getSpaces } from "../../actions/spaces";
import { spaceSelector } from "../../selectors/spaces";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";

// Define types for the Redux state
interface SpaceDetails {
  org_role?: string;
}

interface SpacesState {
  selected: string;
  details: {
    [key: string]: SpaceDetails;
  };
}

interface RootState {
  spaces?: SpacesState;
  sidebar: {
    collapsed: boolean;
  };
}

interface RoleState {
  role: string;
}

interface SpaceState {
  spaces: any[];
  loading: boolean;
  total: number | null;
  hasAttemptedFetch: boolean;
}

const Spaces: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { state: sidebarState } = useSidebar();
  const isMobile = useIsMobile();

  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState<boolean>(!isMobile);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState({
    page: 1,
    limit: isMobile ? 10 : 20,
  });

  const {
    spaces,
    loading,
    total = 0,
    hasAttemptedFetch = false,
  } = useSelector(spaceSelector) as SpaceState;

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

  // Handle sort toggle
  const handleSortToggle = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setFilters({ page: 1, limit: size });
  };

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

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil((total || 0) / filters.limit));

  // Empty state component when no spaces exist
  const EmptySpacesState = () => (
    <div className="flex flex-col items-center justify-center h-full mt-16">
      <div className="bg-gray-50 rounded-full p-6 mb-4">
        <FolderPlus className="h-16 w-16 text-gray-400" />
      </div>
      <h3 className="text-xl font-medium mb-2">No spaces found</h3>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        Spaces help you organize your content. Create your first space to get
        started.
      </p>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <Helmet title={"Spaces"} />

      {/* Mobile Breadcrumb */}
      {isMobile && (
        <MobileBreadcrumb
          currentPage="Spaces"
          parentPath="/"
          parentLabel="Core"
        />
      )}

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
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-10 w-10 border-4 border-primary rounded-full border-t-transparent"></div>
          </div>
        ) : spaces.length === 0 ? (
          <EmptySpacesState />
        ) : (
          <SpaceList
            searchQuery={searchText}
            sortOrder={sortOrder}
            onSortToggle={handleSortToggle}
            filters={filters}
            setFilters={setFilters}
            isMobile={isMobile}
          />
        )}
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
            totalItems={total}
            pageSize={filters.limit}
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
