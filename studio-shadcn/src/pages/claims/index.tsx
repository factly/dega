// Claims.tsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { PlusCircle } from "lucide-react";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useIsMobile } from "@/hooks/use-mobile";

// Shadcn components
import { Button } from "@/components/ui/button";

// Custom components
import ClaimList from "./components/ClaimList";
import Loader from "@/components/Loader";
import SearchInput from "@/components/SearchInput";
import FiltersPopover from "./components/FiltersPopover";
import PaginationFooter from "@/components/PaginationFooter";
import MissingRequirementsAlert from "./components/MissingRequirementsAlert";

// Actions and hooks
import { getClaims } from "../../actions/claims";
import { getRatings } from "../../actions/ratings";
import { getClaimants } from "../../actions/claimants";
import { useForm } from "react-hook-form";
import { useClaimsData } from "./hooks/useClaimsData";
import { useClaimsStatus } from "./hooks/useClaimsStatus";
import { useClaimsPagination } from "./hooks/useClaimsPagination";

// Types
import { ClaimFilters, FormValues } from "./types";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
import SearchButton from "@/components/SearchButton";

function Claims() {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const { search, pathname } = useLocation();
  const query = new URLSearchParams(search);

  // Local state
  const [searchText, setSearchText] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<ClaimFilters>({
    page: 1,
    limit: 20,
    rating: [],
    claimant: [],
    sort: "desc",
    sortBy: "date",
  });
  const [isSearchExpanded, setIsSearchExpanded] = useState(!!query.get("q"));

  // If we have search text, make sure search is expanded on mobile
  useEffect(() => {
    if (searchText && isMobile && !isSearchExpanded) {
      setIsSearchExpanded(true);
    }
  }, [searchText, isMobile, isSearchExpanded]);

  // Initialize form
  const form = useForm<FormValues>({
    defaultValues: {
      q: "",
      sort: filters.sort,
      sortBy: filters.sortBy,
      rating: filters.rating,
      claimant: filters.claimant,
    },
  });

  // Fetch initial data
  useEffect(() => {
    dispatch(getClaims(filters));
    dispatch(getClaimants());
    dispatch(getRatings());
  }, [dispatch, filters]);

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };

  // Use custom hooks
  const { claimantsCount, ratingsCount, claimantsLoading, ratingsLoading } = useClaimsStatus();
  const { claims, total, loading } = useClaimsData(filters, searchText);
  const { totalPages, handlePageChange, handlePageSizeChange, onPagination } =
    useClaimsPagination(filters, setFilters, total);


  const clearSearch = () => {
    setSearchText("");
  };

  const onSave = (values: FormValues) => {
    // Update local state with form values
    setFilters({
      ...filters,
      page: 1, // Reset to page 1 when applying new filters
      rating: values.rating || [],
      claimant: values.claimant || [],
      sort: values.sort || "desc",
      sortBy: values.sortBy || "date",
    });
    setIsFiltersOpen(false);
  };

  const handleSortToggle = () => {
    setFilters({
      ...filters,
      sort: filters.sort === "asc" ? "desc" : "asc",
    });
  };

  const handleSortByChange = (column: string) => {
    // Apply a default order based on the column
    let newSort = filters.sort;
    if (column !== filters.sortBy) {
      // Default date to newest first, default claim to alphabetical (A-Z)
      newSort = column === "date" ? "desc" : "asc";
    }

    setFilters({
      ...filters,
      sortBy: column,
      sort: newSort,
    });
  };

  // Check if any filters are applied
  const hasActiveFilters = () => {
    return !!(
      filters.rating.length > 0 ||
      filters.claimant.length > 0 ||
      filters.sort !== "desc" ||
      filters.sortBy !== "date"
    );
  };

  // Show missing requirements alert if needed
  if (
    (!loading && !claimantsLoading && claimantsCount === 0) ||
    (!ratingsLoading && ratingsCount === 0)
  ) {
    return (
      <MissingRequirementsAlert
        claimantsCount={claimantsCount}
        ratingsCount={ratingsCount}
        claimantsLoading={claimantsLoading}
        ratingsLoading={ratingsLoading}
      />
    );
  }

  // Show loader while loading
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col h-full gap-6">
      <Helmet title="Claims" />

      {/* Header */}
      {isMobile ? (
        <div className="space-y-4 flex justify-between items-center">
          {/* First row */}
          {isMobile && (
            <MobileBreadcrumb currentPage="Pages" parentLabel="Core" />
          )}
          <div className="flex gap-2 items-center">
            <div>
              <SearchButton onClick={toggleSearch} />
            </div>
            <div className="flex items-center gap-2 ml-2">
              <FiltersPopover
                form={form}
                onSave={onSave}
                hasActiveFilters={hasActiveFilters()}
                isOpen={isFiltersOpen}
                setIsOpen={setIsFiltersOpen}
              />
              <Link to="/claims/create">
                <Button size="sm" className="flex items-center">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1">
            <SearchInput
              searchText={searchText}
              setSearchText={setSearchText}
              handleSearchSubmit={() => { }}
              clearSearch={clearSearch}
              autoFocus={false}
            />
            <FiltersPopover
              form={form}
              onSave={onSave}
              hasActiveFilters={hasActiveFilters()}
              isOpen={isFiltersOpen}
              setIsOpen={setIsFiltersOpen}
            />
          </div>
          <Link to="/claims/create">
            <Button size="lg" className="flex items-center gap-2 py-2">
              <PlusCircle className="h-4 w-4" />
              <span>Create Claim</span>
            </Button>
          </Link>
        </div>
      )}
      {/* Search input row - appears when expanded */}
      {(isSearchExpanded && isMobile) && (
        <div className="w-full">
          <SearchInput
            searchText={searchText}
            setSearchText={setSearchText}
            handleSearchSubmit={() => { }}
            clearSearch={clearSearch}
            autoFocus={true}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-scroll">
        <ClaimList
          data={{
            claims,
            total,
            loading,
          }}
          filters={{
            page: filters.page,
            limit: filters.limit,
          }}
          fetchClaims={() => dispatch(getClaims(filters))}
          onPagination={onPagination}
          sortOrder={filters.sort as "asc" | "desc"}
          onSortToggle={handleSortToggle}
          sortBy={filters.sortBy}
          onSortByChange={handleSortByChange}
        />
      </div>

      {/* Footer with Pagination */}
      <PaginationFooter
        currentPage={filters.page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={filters.limit}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}

export default Claims;
