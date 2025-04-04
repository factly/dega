import React, { useEffect, useState, useMemo, useCallback } from "react";
import RatingList from "./components/RatingList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import deepEqual from "deep-equal";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { PlusCircle, Search as SearchIcon } from "lucide-react";
import { useAppDispatch } from "@/hooks/reduxHooks";
import Pagination from "../../components/Pagination";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
import { getRatings } from "../../actions/ratings";

// Type definitions
interface Permission {
  actions: string[];
}

interface RatingFilters {
  page: number;
  limit: number;
}

interface Rating {
  id: string;
  name: string;
  numeric_value: number;
  background_colour?: {
    hex: string;
  };
  text_colour?: {
    hex: string;
  };
}

interface RatingsState {
  req: {
    query: RatingFilters;
    data: string[];
    total: number;
  }[];
  details: {
    [key: string]: Rating;
  };
  loading: boolean;
}

interface RootState {
  ratings: RatingsState;
  sidebar: {
    collapsed: boolean;
  };
}

function Ratings({
  permission = { actions: [] },
}: {
  permission?: Permission;
}): React.ReactElement {
  const { actions } = permission;
  const dispatch = useAppDispatch();
  const { state: sidebarState } = useSidebar();
  const isMobile = useIsMobile();

  // State for search and filters
  const [searchText, setSearchText] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(!isMobile);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [filters, setFilters] = useState<RatingFilters>({
    page: 1,
    limit: isMobile ? 10 : 20,
  });

  // Handle responsive UI changes without triggering data reload
  useEffect(() => {
    // Just update the UI state for search visibility
    setShowSearch(!isMobile);
  }, [isMobile]);

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

  useEffect(() => {
    fetchRatings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchRatings = useCallback(() => {
    dispatch(getRatings(filters));
  }, [dispatch, filters]);

  // Filter ratings based on search text
  const filteredRatings = useMemo(() => {
    if (!searchText.trim()) {
      return ratings;
    }

    return ratings.filter((rating) =>
      rating.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [ratings, searchText]);

  // Sort ratings based on sort order
  const sortedRatings = useMemo(() => {
    return [...filteredRatings].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
  }, [filteredRatings, sortOrder]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Handle sort toggle
  const handleSortToggle = useCallback(() => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setFilters((prev) => ({ ...prev, limit: size, page: 1 }));
  }, []);

  // Toggle search on mobile
  const toggleSearch = useCallback(() => {
    setShowSearch((prev) => !prev);
    if (showSearch) {
      setSearchText("");
    }
  }, [showSearch]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  // Get sidebar state
  const isCollapsed = sidebarState === "collapsed" && !isMobile;

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col h-full">
      <Helmet title={"Ratings"} />

      {/* Mobile Breadcrumb */}
      {isMobile && (
        <MobileBreadcrumb
          currentPage="Ratings"
          parentPath="/"
          parentLabel="Core"
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
          {isMobile && <h1 className="text-xl font-semibold">Ratings</h1>}

          {/* Desktop search bar */}
          {!isMobile && (
            <div className="flex-1 max-w-xs">
              <Input
                placeholder="Search ratings..."
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

            <Link to="/ratings/create">
              {isMobile ? (
                <Button size="icon" className="h-9 w-9">
                  <PlusCircle className="h-5 w-5" />
                </Button>
              ) : (
                <Button size="lg" className="flex items-center gap-2 py-2">
                  <PlusCircle className="h-4 w-4" />
                  Create Rating
                </Button>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search bar */}
        {isMobile && showSearch && (
          <div className="px-4 pb-3">
            <Input
              placeholder="Search ratings..."
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
        <RatingList
          actions={actions}
          data={{
            ratings: sortedRatings,
            total,
            loading,
          }}
          filters={filters}
          setFilters={setFilters}
          fetchRatings={fetchRatings}
          sortOrder={sortOrder}
          onSortToggle={handleSortToggle}
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
          pageSize={filters.limit}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}

export default Ratings;
