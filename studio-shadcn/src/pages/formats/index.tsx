import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import FormatList from "./components/FormatList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search as SearchIcon } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getFormats } from "../../actions/formats";
import deepEqual from "deep-equal";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { useAppDispatch } from "@/hooks/reduxHooks";
import Pagination from "../../components/Pagination";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";

// Define types for the component props and state
interface Format {
  id: string;
  name: string;
  description: string;
  // Add other format properties as needed
}

interface FiltersState {
  page: number;
  limit: number;
}

interface FormatState {
  formats: {
    req: {
      query: FiltersState;
      data: string[];
      total: number;
    }[];
    details: Record<string, Format>;
    loading: boolean;
  };
}

interface RootState {
  formats: FormatState;
  sidebar: {
    collapsed: boolean;
  };
}

function Formats() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRenderDone = useRef(false);
  const isMobile = useIsMobile();

  // State for search and filters
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState<boolean>(!isMobile);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState<FiltersState>({
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "10", 10),
  });

  const { formats, total, loading } = useSelector((state: RootState) => {
    const node = state.formats.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        formats: node.data.map((element) => state.formats.details[element]),
        total: node.total,
        loading: state.formats.loading,
      };
    return { formats: [], total: 0, loading: state.formats.loading };
  });

  // Filter and sort formats based on search text and sort order
  const filteredFormats = useMemo(() => {
    let filtered = formats;

    // Apply search filter
    if (searchText.trim()) {
      filtered = formats.filter(
        (format) =>
          format.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          format.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      if (sortOrder === "asc") {
        return (a.name || "").localeCompare(b.name || "");
      } else {
        return (b.name || "").localeCompare(a.name || "");
      }
    });
  }, [formats, searchText, sortOrder]);

  // Update URL when filters change, but don't cause a re-render
  useEffect(() => {
    if (initialRenderDone.current) {
      const newSearchParams = new URLSearchParams();
      newSearchParams.set("page", filters.page.toString());
      newSearchParams.set("limit", filters.limit.toString());
      setSearchParams(newSearchParams, { replace: true });
    } else {
      initialRenderDone.current = true;
    }
  }, [filters, setSearchParams]);

  // Fetch formats when filters change
  useEffect(() => {
    fetchFormats();
  }, [filters]);

  const fetchFormats = useCallback(() => {
    dispatch(getFormats(filters));
  }, [dispatch, filters]);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setFilters({ page: 1, limit: size });
  }, []);

  // Sort toggle handler
  const handleSortToggle = useCallback(() => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
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

  // Get sidebar state from Redux store
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.collapsed
  );

  // Calculate left margin based on sidebar state
  const sidebarWidth = isCollapsed ? "89px" : "265px";

  if (loading && formats.length === 0) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col h-full">
      <Helmet title={"Formats"} />

      {/* Mobile Breadcrumb */}
      {isMobile && (
        <MobileBreadcrumb
          currentPage="Formats"
          parentPath="/settings/advanced"
          parentLabel="Advanced Settings"
        />
      )}

      {/* Header */}
      <div
        className={`${isMobile ? "sticky top-0" : "fixed"} z-10 bg-white`}
        style={
          !isMobile
            ? {
                left: sidebarWidth,
                right: 0,
                transition: "left 0.3s ease",
              }
            : undefined
        }
      >
        <div
          className={`flex justify-between items-center ${
            isMobile ? "pb-3 pt-1" : "px-6 pt-1 h-full"
          }`}
        >
          {/* Title for mobile */}
          {isMobile && <h1 className="text-xl font-semibold">Formats</h1>}

          {/* Desktop search bar */}
          {!isMobile && (
            <div className="flex-1 max-w-xs">
              <Input
                placeholder="Search formats..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
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

            <Link to="/settings/advanced/formats/create">
              {isMobile ? (
                <Button size="icon" className="h-9 w-9">
                  <PlusCircle className="h-5 w-5" />
                </Button>
              ) : (
                <Button size="lg" className="flex items-center gap-2 py-2">
                  <PlusCircle className="h-4 w-4" />
                  New Format
                </Button>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search bar */}
        {isMobile && showSearch && (
          <div className="px-4 pb-3">
            <Input
              placeholder="Search formats..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="h-9 w-full"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Content */}
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
                left: sidebarWidth,
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
        <FormatList
          data={{ formats: filteredFormats, total, loading }}
          filters={filters}
          setFilters={setFilters}
          fetchFormats={fetchFormats}
          sortOrder={sortOrder}
          onSortToggle={handleSortToggle}
          isMobile={isMobile}
        />
      </div>

      {/* Footer with Pagination */}
      <div
        className={`${
          isMobile ? "fixed bottom-0 left-0 right-0 py-3" : "fixed bottom-0"
        } z-10 bg-white`}
        style={
          !isMobile
            ? {
                left: sidebarWidth,
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

export default Formats;
