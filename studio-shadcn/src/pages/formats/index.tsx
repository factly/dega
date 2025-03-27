import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import FormatList from "./components/FormatList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getFormats } from "../../actions/formats";
import deepEqual from "deep-equal";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { useAppDispatch } from "@/hooks/reduxHooks";
import Pagination from "../../components/Pagination";

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
  const [searchText, setSearchText] = useState("");
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

  if (loading && formats.length === 0) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col h-full">
      <Helmet title={"Formats"} />

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
                placeholder="Search formats..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="h-10"
              />
            </div>
          </div>
          <div>
            <Link to="/settings/advanced/formats/create">
              <Button size="lg" className="flex items-center gap-2 py-2">
                <PlusCircle className="h-4 w-4" />
                New Format
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
        <FormatList
          data={{ formats: filteredFormats, total, loading }}
          filters={filters}
          setFilters={setFilters}
          fetchFormats={fetchFormats}
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

export default Formats;
