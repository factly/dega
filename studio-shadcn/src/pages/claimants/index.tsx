/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useMemo } from "react";
import ClaimantList from "./components/ClaimantList";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getClaimants } from "../../actions/claimants";
import deepEqual from "deep-equal";
import getUrlParams from "../../utils/getUrlParams";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/hooks/reduxHooks";

interface ClaimantType {
  id: string;
  name: string;
  tag_line: string;
  [key: string]: any;
}

interface ClaimantState {
  req: {
    query: Record<string, any>;
    data: string[];
    total: number;
  }[];
  details: Record<string, ClaimantType>;
  loading: boolean;
}

interface RootState {
  claimants: ClaimantState;
}

function Claimants() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Use the URL search directly - avoid derived state
  const urlParams = useMemo(
    () => getUrlParams(new URLSearchParams(location.search)),
    [location.search]
  );

  // Get data from Redux using the URL parameters directly
  const { claimants, loading } = useSelector((state: RootState) => {
    const node = state.claimants.req.find((item) => {
      return deepEqual(item.query, urlParams);
    });

    if (node)
      return {
        claimants: node.data.map((element) => state.claimants.details[element]),
        total: node.total,
        loading: state.claimants.loading,
      };
    return { claimants: [], total: 0, loading: state.claimants.loading };
  });

  // Filter and sort claimants locally based on search text and sort order
  const filteredClaimants = useMemo(() => {
    let filtered = claimants;

    // Apply search filter
    if (searchText.trim()) {
      filtered = claimants.filter(
        (claimant) =>
          claimant.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          claimant.tag_line?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name?.localeCompare(b.name || "") || 0;
      } else {
        return b.name?.localeCompare(a.name || "") || 0;
      }
    });
  }, [claimants, searchText, sortOrder]);

  const handleSortToggle = useCallback(() => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  }, []);

  useEffect(() => {
    const paramsToUse = {
      ...urlParams,
      page: urlParams.page || 1,
      limit: urlParams.limit || 10,
    };

    dispatch(getClaimants(paramsToUse));
  }, [location.search, dispatch]);

  // Memoized fetch function that won't change on re-renders
  const fetchClaimants = useCallback(() => {
    const paramsToUse = {
      ...urlParams,
      page: urlParams.page || 1,
      limit: urlParams.limit || 10,
    };

    dispatch(getClaimants(paramsToUse));
  }, [dispatch, urlParams]);

  // Update URL with new parameters
  const updateURLParams = useCallback(
    (newParams: Record<string, any>) => {
      const searchParams = new URLSearchParams();

      // Combine existing params with new ones
      const combinedParams = {
        ...urlParams,
        ...newParams,
      };

      // Only add non-empty/non-default values to keep URL clean
      Object.entries(combinedParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Don't add default pagination values to URL
          if (
            (key === "page" && value === 1) ||
            (key === "limit" && value === 10)
          ) {
            return;
          }
          searchParams.set(key, String(value));
        }
      });

      navigate(
        {
          pathname: location.pathname,
          search: searchParams.toString(),
        },
        { replace: true }
      );
    },
    [urlParams, navigate, location.pathname]
  );

  // Define user permissions array
  const userActions = ["view"]; // Default minimum permissions

  return loading ? (
    <Loader />
  ) : (
    <div className="flex flex-col space-y-4">
      <Helmet title={"Claimants"} />

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-63">
          <Input
            className="py-2"
            placeholder="Search claimants..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <Link to="/claimants/create">
          <Button className="rounded-md px-4 flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Create claimant
          </Button>
        </Link>
      </div>

      <ClaimantList
        data={{
          claimants: filteredClaimants,
          total: filteredClaimants.length,
          loading,
        }}
        filters={urlParams}
        setFilters={updateURLParams}
        fetchClaimants={fetchClaimants}
        actions={userActions}
        sortOrder={sortOrder}
        onSortToggle={handleSortToggle}
      />
    </div>
  );
}

export default Claimants;
