import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import deepEqual from "deep-equal";
import { Helmet } from "react-helmet";
import { PlusCircle, Filter } from "lucide-react";
import { useAppDispatch } from "@/hooks/reduxHooks";
// Shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Custom components
import ClaimList from "./components/ClaimList";
import Selector from "../../components/Selector";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";

// Actions and utils
import { getClaims } from "../../actions/claims";
import { getRatings } from "../../actions/ratings";
import { getClaimants } from "../../actions/claimants";
import { useForm } from "react-hook-form";

// Types
interface FormValues {
  q?: string;
  sort?: string;
  rating?: string[];
  claimant?: string[];
  sortBy?: string;
  [key: string]: any;
}

function Claims() {
  const dispatch = useAppDispatch();

  // Local state for filters and pagination
  const [searchText, setSearchText] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  // Local state for filters and pagination (similar to SpaceList)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    rating: [] as string[],
    claimant: [] as string[],
    sort: "desc",
    sortBy: "date",
  });

  // Initialize form with filter values
  const form = useForm<FormValues>({
    defaultValues: {
      q: "",
      sort: filters.sort,
      sortBy: filters.sortBy,
      rating: filters.rating,
      claimant: filters.claimant,
    },
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobileScreen(true);
      } else {
        setIsMobileScreen(false);
      }
    };

    // For Vite, we can use the window object directly but add a check
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      handleResize();
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Fetch claims when filters change
  useEffect(() => {
    dispatch(getClaims(filters));
  }, [dispatch, filters]);

  // Load claimants and ratings on component mount
  useEffect(() => {
    dispatch(getClaimants());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getRatings());
  }, [dispatch]);

  const { claimantsCount, ratingsCount, claimantsLoading, ratingsLoading } =
    useSelector(({ claimants, ratings }: any) => {
      return {
        claimantsCount: claimants?.req?.[0]?.data
          ? claimants?.req?.[0]?.data.length
          : 0,
        ratingsCount: Object.keys(ratings.details).length,
        claimantsLoading: claimants.loading,
        ratingsLoading: ratings.loading,
      };
    });

  const { claims, total, loading } = useSelector((state: any) => {
    const node = state.claims.req.find((item: any) => {
      return deepEqual(item.query, filters);
    });

    if (node) {
      // Create a new array with copied and enriched claim objects
      const list = node.data.map((element: string) => {
        // Get the original claim from state
        const originalClaim = state.claims.details[element];

        // Don't mutate the original claim - create a new object
        return {
          ...originalClaim,
          // Add the formatted claimant and rating names instead of mutating
          claimant:
            state.claimants.details[originalClaim.claimant_id]?.name || "",
          rating: state.ratings.details[originalClaim.rating_id]?.name || "",
        };
      });

      return {
        claims: list,
        total: node.total,
        loading: state.claims.loading,
      };
    }
    return { claims: [], total: 0, loading: state.claims.loading };
  });

  // Filter and sort claims based on parameters
  const sortedClaims = useMemo(() => {
    if (!claims) return [];

    // First create a copy of the claims array to sort
    const sortableClaims = [...claims];

    // Sort based on sortBy param
    return sortableClaims.sort((a, b) => {
      if (filters.sortBy === "claim") {
        // Sort alphabetically by claim text
        const aText = a.claim || "";
        const bText = b.claim || "";
        const comparison = aText.localeCompare(bText);
        return filters.sort === "asc" ? comparison : -comparison;
      } else {
        // Sort by claim date (default)
        const dateA = new Date(a.claim_date || "").getTime();
        const dateB = new Date(b.claim_date || "").getTime();
        return filters.sort === "asc"
          ? dateA - dateB // Oldest first
          : dateB - dateA; // Newest first
      }
    });
  }, [claims, filters.sort, filters.sortBy]);

  // Filter claims locally based on search text
  const filteredClaims = useMemo(() => {
    if (!searchText.trim()) {
      return sortedClaims;
    }

    return sortedClaims.filter(
      (claim) =>
        claim.claim?.toLowerCase().includes(searchText.toLowerCase()) ||
        claim.claimant?.toLowerCase().includes(searchText.toLowerCase()) ||
        claim.rating?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [sortedClaims, searchText]);

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

    // Close the filters popover after applying
    setIsFiltersOpen(false);
  };

  const handlePageChange = (page: number) => {
    setFilters({
      ...filters,
      page,
    });
  };

  const handlePageSizeChange = (limit: number) => {
    setFilters({
      ...filters,
      page: 1, // Reset to first page when changing page size
      limit,
    });
  };

  const handleSortToggle = () => {
    setFilters({
      ...filters,
      sort: filters.sort === "asc" ? "desc" : "asc",
    });
  };

  const handleSortByChange = (column: string) => {
    // apply a default order based on the column
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

  // Get sidebar state from Redux store
  const isCollapsed = useSelector((state: any) => state.sidebar.collapsed);

  // Calculate sidebar width based on collapsed state
  const sidebarWidth = isCollapsed ? "89px" : "265px";

  // Define the header height (including padding)
  const headerHeight = "calc(1.5rem + 2.5rem + 1rem)"; // top padding + height + bottom padding

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  if (
    (!loading && !claimantsLoading && claimantsCount === 0) ||
    (!ratingsLoading && ratingsCount === 0)
  ) {
    const isRatingsCountZero = !ratingsLoading && ratingsCount === 0;
    const isClaimantsCountZero = !claimantsLoading && claimantsCount === 0;

    const title =
      isClaimantsCountZero && isRatingsCountZero
        ? "No claimants and ratings found"
        : isClaimantsCountZero
        ? "No claimants found"
        : "No ratings found";

    const subTitle =
      isClaimantsCountZero && isRatingsCountZero
        ? "Create claimants and ratings first to create claims"
        : isClaimantsCountZero
        ? "Create claimants to first to create claims"
        : "Create ratings first to create claims";

    const extra =
      isClaimantsCountZero && isRatingsCountZero ? (
        <div className="flex justify-center space-x-4">
          <Link to="/claimants/create">
            <Button>Create claimant</Button>
          </Link>
          <Link to="/ratings/create">
            <Button>Create Ratings</Button>
          </Link>
        </div>
      ) : isClaimantsCountZero ? (
        <Link to="/claimants/create">
          <Button>Create claimant</Button>
        </Link>
      ) : (
        <Link to="/ratings/create">
          <Button>Create Ratings</Button>
        </Link>
      );

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{subTitle}</AlertDescription>
          <div className="mt-4">{extra}</div>
        </Alert>
      </div>
    );
  }

  return loading ? (
    <Loader />
  ) : (
    <div className="flex flex-col h-full">
      <Helmet title={"Claims"} />

      {/* Header */}
      <div
        className="fixed top-0 z-10 bg-white"
        style={{
          left: sidebarWidth,
          right: 0,
          height: headerHeight,
          transition: "left 0.3s ease",
        }}
      >
        <div className="flex justify-between items-center h-full px-6 pt-1">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Input
                placeholder="Search claims..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="h-10"
              />
            </div>

            <Form {...form}>
              <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={hasActiveFilters() ? "default" : "outline"}
                    className="flex items-center gap-2 bg-[#F0F5FF] text-[#0D1D2D] font-normal"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm">Filters</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="claimant"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Claimants</FormLabel>
                            <Selector
                              mode="multiple"
                              createEntity="Claimant"
                              action="Claimants"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ratings</FormLabel>
                            <Selector
                              mode="multiple"
                              createEntity="Rating"
                              action="Ratings"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button type="button" onClick={form.handleSubmit(onSave)}>
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </Form>
          </div>

          <div>
            <Link to="/claims/create">
              <Button size="lg" className="flex items-center py-2">
                <PlusCircle className="h-4 w-4" />
                Create Claim
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="absolute overflow-auto"
        style={{
          top: headerHeight,
          left: sidebarWidth,
          right: 0,
          bottom: "64px",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          paddingBottom: "1.5rem",
          paddingTop: "1rem",
          transition: "left 0.3s ease, top 0.3s ease",
        }}
      >
        <ClaimList
          data={{
            claims: filteredClaims,
            total: total,
            loading: loading,
          }}
          filters={{
            page: filters.page,
            limit: filters.limit,
          }}
          fetchClaims={() => dispatch(getClaims(filters))}
          onPagination={(page, limit) => {
            handlePageChange(page);
            if (limit !== filters.limit) {
              handlePageSizeChange(limit);
            }
          }}
          sortOrder={filters.sort as "asc" | "desc"}
          onSortToggle={handleSortToggle}
          sortBy={filters.sortBy}
          onSortByChange={handleSortByChange}
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
}

export default Claims;
