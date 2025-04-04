/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useMemo } from "react";
import ClaimantList from "./components/ClaimantList";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { getClaimants } from "../../actions/claimants";
import deepEqual from "deep-equal";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { PlusCircle, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/hooks/reduxHooks";
import Pagination from "../../components/Pagination";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";

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
  const { state: sidebarState } = useSidebar();
  const isMobile = useIsMobile();

  // State for search and filters
  const [searchText, setSearchText] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(!isMobile);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });

  // Handle responsive UI changes
  useEffect(() => {
    setShowSearch(!isMobile);
  }, [isMobile]);

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

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setFilters({ page: 1, limit: size });
  }, []);

  // Calculate total pages
  const pageSize = filters.limit || 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Get sidebar state
  const isCollapsed = sidebarState === "collapsed" && !isMobile;

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col h-full">
      <Helmet title={"Claimants"} />

      {/* Mobile Breadcrumb */}
      {isMobile && (
        <MobileBreadcrumb
          currentPage="Claimants"
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
          {isMobile && <h1 className="text-xl font-semibold">Claimants</h1>}

          {/* Desktop search bar */}
          {!isMobile && (
            <div className="flex-1 max-w-xs">
              <Input
                placeholder="Search claimants..."
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

            <Link to="/claimants/create">
              {isMobile ? (
                <Button size="icon" className="h-9 w-9">
                  <PlusCircle className="h-5 w-5" />
                </Button>
              ) : (
                <Button size="lg" className="flex items-center gap-2 py-2">
                  <PlusCircle className="h-4 w-4" />
                  Create claimant
                </Button>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search bar */}
        {isMobile && showSearch && (
          <div className="px-4 pb-3">
            <Input
              placeholder="Search claimants..."
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
        <ClaimantList
          data={{
            claimants: filteredClaimants,
            total: total,
            loading,
          }}
          filters={filters}
          setFilters={setFilters}
          fetchClaimants={fetchClaimants}
          actions={["view"]}
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
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}

export default Claimants;
