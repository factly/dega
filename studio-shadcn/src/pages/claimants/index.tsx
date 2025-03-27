/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useMemo } from "react";
import ClaimantList from "./components/ClaimantList";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { getClaimants } from "../../actions/claimants";
import deepEqual from "deep-equal";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/hooks/reduxHooks";
import Pagination from "../../components/Pagination";

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
  sidebar: {
    collapsed: boolean;
  };
}

function Claimants() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });

  // Get data from Redux
  const { claimants, total, loading } = useSelector((state: RootState) => {
    const node = state.claimants.req.find((item) => {
      return deepEqual(item.query, filters);
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
    fetchClaimants();
  }, [filters]);

  // Fetch claimants function
  const fetchClaimants = useCallback(() => {
    dispatch(getClaimants(filters));
  }, [dispatch, filters]);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setFilters({ page: 1, limit: size });
  }, []);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  // Get sidebar state from Redux store
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.collapsed
  );

  // Calculate left margin based on sidebar state
  const sidebarWidth = isCollapsed ? "89px" : "265px";

  // Define the header height (including padding)
  const headerHeight = "calc(1.5rem + 2.5rem + 1rem)"; // top padding + height + bottom padding

  // Define user permissions array
  const userActions = ["view"]; // Default minimum permissions

  return loading ? (
    <Loader />
  ) : (
    <div className="flex flex-col h-full">
      <Helmet title={"Claimants"} />

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
                placeholder="Search claimants..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="h-10"
              />
            </div>
          </div>
          <div>
            <Link to="/claimants/create">
              <Button size="lg" className="flex items-center gap-2 py-2">
                <PlusCircle className="h-4 w-4" />
                Create claimant
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
        <ClaimantList
          data={{
            claimants: filteredClaimants,
            total: total,
            loading,
          }}
          filters={filters}
          setFilters={setFilters}
          fetchClaimants={fetchClaimants}
          actions={userActions}
          sortOrder={sortOrder}
          onSortToggle={handleSortToggle}
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

export default Claimants;
