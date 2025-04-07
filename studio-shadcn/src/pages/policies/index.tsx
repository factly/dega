import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search as SearchIcon } from "lucide-react";
import PolicyList from "./components/PolicyList";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getPolicies } from "../../actions/policies";
import deepEqual from "deep-equal";
import getUserPermission from "../../utils/getUserPermission";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { Input } from "@/components/ui/input";
import Pagination from "../../components/Pagination";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";

// Define types for our state and props
interface Policy {
  id: string;
  name: string;
  description?: string;
  // Add other policy properties as needed
}

interface PolicyState {
  details: Record<string, Policy>;
  loading: boolean;
  req: Array<{
    query: PolicyFilters;
    data: string[];
    total: number;
  }>;
}

interface RootState {
  policies: PolicyState;
  spaces: any;
}

interface PolicyFilters {
  page: number;
  limit: number;
  [key: string]: any; // For any additional filters
}

const Policies: React.FC = () => {
  const spaces = useSelector((state: RootState) => state.spaces);
  const actions = getUserPermission({
    resource: "policies",
    action: "get",
    spaces,
  });
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();

  // State for search and filters
  const [searchText, setSearchText] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(!isMobile);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Initialize filters from URL params or defaults
  const [filters, setFilters] = useState<PolicyFilters>({
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "10", 10),
  });

  // Update URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      newParams.set(key, value.toString());
    });
    setSearchParams(newParams);
  }, [filters, setSearchParams]);

  // Fetch policies when filters change
  useEffect(() => {
    fetchPolicies();
  }, [filters]);

  const { policies, total, loading } = useSelector((state: RootState) => {
    const node = state.policies.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node) {
      return {
        policies: node.data.map((element) => state.policies.details[element]),
        total: node.total,
        loading: state.policies.loading,
      };
    }

    return { policies: [], total: 0, loading: state.policies.loading };
  });

  // Filter policies locally based on search text
  const filteredPolicies = React.useMemo(() => {
    if (!searchText.trim()) {
      return policies;
    }

    return policies.filter((policy) =>
      policy.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [policies, searchText]);

  // Sort policies based on sort order
  const sortedPolicies = React.useMemo(() => {
    return [...filteredPolicies].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name?.localeCompare(b.name || "") || 0;
      } else {
        return b.name?.localeCompare(a.name || "") || 0;
      }
    });
  }, [filteredPolicies, sortOrder]);

  const fetchPolicies = useCallback(() => {
    dispatch(getPolicies(filters));
  }, [dispatch, filters]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Handle sort toggle
  const handleSortToggle = useCallback(() => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  }, []);

  // Pagination handlers
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

  const pageSize = filters.limit || 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col h-full">
      <Helmet title={"Policies"} />

      {/* Mobile Breadcrumb */}
      {isMobile && (
        <MobileBreadcrumb
          currentPage="Policies"
          parentPath="/settings/members"
          parentLabel="Member Settings"
        />
      )}

      <div
        className={`${isMobile ? "sticky top-0" : "fixed"} z-10 bg-white`}
        style={
          !isMobile
            ? {
                left: "265px",
                right: 0,
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
          {isMobile && <h1 className="text-xl font-semibold">Policies</h1>}

          {/* Desktop search bar */}
          {!isMobile && (
            <div className="flex-1 max-w-xs">
              <Input
                placeholder="Search policies..."
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

            <Link to="/settings/members/policies/create">
              {isMobile ? (
                <Button
                  size="icon"
                  className="h-9 w-9"
                  disabled={
                    !(actions.includes("admin") || actions.includes("create"))
                  }
                >
                  <PlusCircle className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="flex items-center gap-2 py-2"
                  disabled={
                    !(actions.includes("admin") || actions.includes("create"))
                  }
                >
                  <PlusCircle className="h-4 w-4" />
                  New Policy
                </Button>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search bar */}
        {isMobile && showSearch && (
          <div className="px-4 pb-3">
            <Input
              placeholder="Search policies..."
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
                left: "265px",
                right: 0,
                bottom: "64px",
                paddingLeft: "1.5rem",
                paddingRight: "1.5rem",
                paddingBottom: "1.5rem",
                paddingTop: "1rem",
              }
            : undefined
        }
      >
        <PolicyList
          actions={actions}
          data={{
            policies: sortedPolicies,
            total: total,
            loading,
          }}
          filters={filters}
          setFilters={setFilters}
          fetchPolicies={fetchPolicies}
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
                left: "265px",
                right: 0,
                height: "64px",
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

export default Policies;
