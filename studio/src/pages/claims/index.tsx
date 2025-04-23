import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { PlusCircle } from "lucide-react";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
// Custom components
import ClaimList from "./components/ClaimList";
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
import { ClaimFilters, FormValues } from "./types";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
import SearchButton from "@/components/SearchButton";
import SecuredButton from "@/components/SecuredButton";

function Claims() {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const [searchText, setSearchText] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<ClaimFilters>({
    page: 1,
    limit: 20,
    rating: [],
    claimant: [],
    sortBy: "date",
  });
  const [isSearchExpanded, setIsSearchExpanded] = useState(!!query.get("q"));

  useEffect(() => {
    if (searchText && isMobile && !isSearchExpanded) {
      setIsSearchExpanded(true);
    }
  }, [searchText, isMobile, isSearchExpanded]);

  // Initialize form
  const form = useForm<FormValues>({
    defaultValues: {
      q: "",
      sortBy: filters.sortBy,
      rating: filters.rating,
      claimant: filters.claimant,
    },
  });

  // Fetch initial data
  useEffect(() => {
    dispatch(getClaims(filters));
    dispatch(getClaimants({ limit: 100 }));
    dispatch(getRatings({ limit: 100 }));
  }, [dispatch, filters]);

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };

  // Use custom hooks
  const { claimantsCount, ratingsCount, claimantsLoading, ratingsLoading } =
    useClaimsStatus();
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
      sortBy: values.sortBy || "date",
    });
    setIsFiltersOpen(false);
  };

  const handleSortByChange = (column: string) => {
    setFilters({
      ...filters,
      sortBy: column,
    });
  };

  // Check if any filters are applied
  const hasActiveFilters = () => {
    return !!(
      filters.rating.length > 0 ||
      filters.claimant.length > 0 ||
      filters.sortBy !== "date"
    );
  };

  const handleCreateClaim = () => {
    window.location.href = "/claims/create";
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

  return (
    <div className="flex flex-col h-full gap-6">
      <Helmet title="Claims" />

      {/* Header */}
      {isMobile ? (
        <div className="space-y-4 flex justify-between items-center">
          {isMobile && (
            <div className="flex flex-col">
              <MobileBreadcrumb
                currentPage="Claims"
                parentLabel="Fact Checking"
              />
              {isMobile && <h1 className="text-xl font-semibold">Claims</h1>}
            </div>
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
              <SecuredButton
                size="sm"
                className="flex items-center"
                onClick={handleCreateClaim}
              >
                <PlusCircle className="h-4 w-4" />
              </SecuredButton>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1">
            <SearchInput
              searchText={searchText}
              setSearchText={setSearchText}
              handleSearchSubmit={() => {}}
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
          <SecuredButton
            size="lg"
            className="flex items-center gap-2 py-2"
            onClick={handleCreateClaim}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Claim</span>
          </SecuredButton>
        </div>
      )}
      {isSearchExpanded && isMobile && (
        <div className="w-full">
          <SearchInput
            searchText={searchText}
            setSearchText={setSearchText}
            handleSearchSubmit={() => {}}
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
