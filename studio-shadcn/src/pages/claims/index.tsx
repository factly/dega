/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
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

// Actions and utils
import { getClaims } from "../../actions/claims";
import getUrlParams from "../../utils/getUrlParams";
import Filters from "../../utils/filters";
import { getRatings } from "../../actions/ratings";
import { getClaimants } from "../../actions/claimants";
import { useForm } from "react-hook-form";

// Types
interface ParamsType {
  page?: number;
  limit?: number;
  q?: string;
  sort?: string;
  rating?: string[] | string;
  claimant?: string[] | string;
  [key: string]: any;
}

interface FormValues {
  q?: string;
  sort?: string;
  rating?: string[];
  claimant?: string[];
  [key: string]: any;
}

function Claims() {
  const dispatch = useAppDispatch();
  const { search } = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(search);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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

  const keys = ["page", "limit", "q", "sort", "rating", "claimant"];
  const params = getUrlParams(query, keys) as ParamsType;

  // Convert string params to numbers where needed
  if (params.page) params.page = Number(params.page);
  if (params.limit) params.limit = Number(params.limit);

  // Initialize form with properly formatted filter values
  const initialFormValues: FormValues = {
    q: params.q,
    sort: params.sort,
    // Convert single values to arrays for multiselect fields
    rating: Array.isArray(params.rating)
      ? params.rating
      : params.rating
      ? [params.rating]
      : [],
    claimant: Array.isArray(params.claimant)
      ? params.claimant
      : params.claimant
      ? [params.claimant]
      : [],
  };

  const form = useForm<FormValues>({
    defaultValues: initialFormValues,
  });

  useEffect(() => {
    if (form) {
      // Reset form with new values when URL changes
      const formattedParams = new Filters(params);
      form.reset(formattedParams);
    }
  }, [search]);

  useEffect(() => {
    dispatch(getClaims(params));
  }, [search, dispatch]);

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
      return deepEqual(item.query, params);
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

  // State for local search without triggering URL updates
  const [searchText, setSearchText] = useState("");

  // Filter claims locally based on search text
  const filteredClaims = useMemo(() => {
    if (!searchText.trim()) {
      return claims;
    }

    return claims.filter(
      (claim) =>
        claim.claim?.toLowerCase().includes(searchText.toLowerCase()) ||
        claim.claimant?.toLowerCase().includes(searchText.toLowerCase()) ||
        claim.rating?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [claims, searchText]);

  const onSave = (values: FormValues) => {
    const searchFilter = new URLSearchParams();

    // Process and add all form values to the URL parameters
    Object.keys(values).forEach((key) => {
      const value = values[key];
      if (value) {
        if ((key === "rating" || key === "claimant") && Array.isArray(value)) {
          // Handle array values - append each item with the same key
          value.forEach((item) => {
            if (item) searchFilter.append(key, item);
          });
        } else if (value) {
          // Handle single values
          searchFilter.set(key, value as string);
        }
      }
    });

    // Set page to 1 when applying new filters
    searchFilter.set("page", "1");

    // Keep the current limit if it exists
    if (params.limit) {
      searchFilter.set("limit", params.limit.toString());
    }

    navigate({
      pathname: "/claims",
      search: searchFilter.toString() ? "?" + searchFilter.toString() : "",
    });

    // Close the filters popover after applying
    setIsFiltersOpen(false);
  };

  const onPagination = (page: number, limit: number) => {
    const newQuery = new URLSearchParams(query.toString());
    newQuery.set("limit", limit.toString());
    newQuery.set("page", page.toString());

    navigate({
      pathname: "/claims",
      search: "?" + newQuery.toString(),
    });
  };

  // Check if any filters are applied
  const hasActiveFilters = () => {
    return !!(
      (params.rating &&
        (Array.isArray(params.rating) ? params.rating.length > 0 : true)) ||
      (params.claimant &&
        (Array.isArray(params.claimant) ? params.claimant.length > 0 : true)) ||
      params.sort
    );
  };

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
    <div className="flex flex-col space-y-4">
      <Helmet title={"Claims"} />
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <div className="relative w-63">
            <Input
              className="py-2"
              placeholder="Search claims..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
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

                    <FormField
                      control={form.control}
                      name="sort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sort By</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value || "desc"}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="desc">Latest</SelectItem>
                              <SelectItem value="asc">Old</SelectItem>
                            </SelectContent>
                          </Select>
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

        <Link to="/claims/create">
          <Button className="rounded-md px-4 flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Claim
          </Button>
        </Link>
      </div>

      <ClaimList
        data={{
          claims: filteredClaims,
          total: total,
          loading,
        }}
        filters={{
          page: Number(params.page) || 1,
          limit: Number(params.limit) || 10,
        }}
        fetchClaims={() => dispatch(getClaims(params))}
        onPagination={onPagination}
      />
    </div>
  );
}

export default Claims;
