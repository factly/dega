import { useEffect, useState, useRef, useCallback } from "react";
import FormatList from "./components/FormatList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search as SearchIcon } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { getFormats } from "../../actions/formats";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { useAppDispatch } from "@/hooks/reduxHooks";
import Pagination from "../../components/Pagination";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
import { useSelector } from "react-redux";
import { FormatFilters, RootState } from "./types";
import { useFormatsData } from "./hooks/useFormatsData";
import { useFormatsPagination } from "./hooks/useFormatsPagination";
import SecuredButton from "@/components/SecuredButton";

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
  const [filters, setFilters] = useState<FormatFilters>({
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "10", 10),
  });

  // Create a function that matches the expected signature in FormatListProps
  const updateFilters = useCallback((newFilters: Partial<FormatFilters>) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  }, []);

  // Use custom hooks for data and pagination
  const { formats, total, loading } = useFormatsData(
    filters,
    searchText,
    sortOrder
  );
  const { pageSize, totalPages, handlePageChange, handlePageSizeChange } =
    useFormatsPagination(filters, updateFilters, total);

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

  // Handle navigation to create format page
  const handleCreateFormat = () => {
    window.location.href = "/settings/advanced/formats/create";
  };

  // Get sidebar state from Redux store
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.collapsed
  );

  // Calculate left margin based on sidebar state
  const sidebarWidth = isCollapsed ? "89px" : "265px";

  // Handle responsive UI changes
  useEffect(() => {
    setShowSearch(!isMobile);
  }, [isMobile]);

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

            {isMobile ? (
              <SecuredButton
                className="h-9 w-9"
                size="icon"
                onClick={handleCreateFormat}
              >
                <PlusCircle className="h-5 w-5" />
              </SecuredButton>
            ) : (
              <SecuredButton
                className="flex items-center gap-2 py-2"
                size="lg"
                onClick={handleCreateFormat}
              >
                <PlusCircle className="h-4 w-4" />
                Create Format
              </SecuredButton>
            )}
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
          data={{ formats, total, loading }}
          filters={filters}
          setFilters={updateFilters}
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
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}

export default Formats;
