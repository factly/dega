import React, { useEffect, useState, useCallback } from "react";
import RatingList from "./components/RatingList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { PlusCircle, Search as SearchIcon } from "lucide-react";
import { useAppDispatch } from "@/hooks/reduxHooks";
import Pagination from "../../components/Pagination";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
import { getRatings } from "../../actions/ratings";
import { Permission, RatingFilters } from "./types";
import { useRatingsData } from "./hooks/useRatingsData";
import { useRatingsPagination } from "./hooks/useRatingsPagination";
import SecuredButton from "@/components/SecuredButton";

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
  const [filters, setFilters] = useState<RatingFilters>({
    page: 1,
    limit: isMobile ? 10 : 20,
  });

  // Handle responsive UI changes
  useEffect(() => {
    setShowSearch(!isMobile);
  }, [isMobile]);

  // Use custom hooks for data and pagination
  const { ratings, total, loading } = useRatingsData(filters, searchText);
  const { pageSize, totalPages, handlePageChange, handlePageSizeChange } =
    useRatingsPagination(filters, setFilters, total);

  // Fetch ratings when filters change
  useEffect(() => {
    dispatch(getRatings(filters));
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

  // Fetch ratings function for the list component
  const fetchRatings = useCallback(() => {
    dispatch(getRatings(filters));
  }, [dispatch, filters]);

  // Handle navigation to create rating page
  const handleCreateRating = () => {
    window.location.href = "/ratings/create";
  };

  // Get sidebar state
  const isCollapsed = sidebarState === "collapsed" && !isMobile;

  if (loading) {
    return (
      <div className="flex flex-col h-full relative">
        <Helmet title="Ratings" />
        {isMobile && (
          <MobileBreadcrumb currentPage="Ratings" parentLabel="Fact Checking" />
        )}
        <div className="flex-1 flex items-center justify-center">
          <Loader className="relative inset-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Helmet title={"Ratings"} />

      {/* Mobile Breadcrumb */}
      {isMobile && (
        <MobileBreadcrumb currentPage="Ratings" parentLabel="Fact Checking" />
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

            {isMobile ? (
              <SecuredButton
                size="icon"
                className="h-9 w-9"
                onClick={handleCreateRating}
              >
                <PlusCircle className="h-5 w-5" />
              </SecuredButton>
            ) : (
              <SecuredButton
                size="lg"
                className="flex items-center gap-2 py-2"
                onClick={handleCreateRating}
              >
                <PlusCircle className="h-4 w-4" />
                Create Rating
              </SecuredButton>
            )}
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
            ratings,
            total,
            loading,
          }}
          filters={filters}
          setFilters={setFilters}
          fetchRatings={fetchRatings}
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
}

export default Ratings;
