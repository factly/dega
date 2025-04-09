// FactCheck.tsx
import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import debounce from "lodash/debounce";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusCircle, X } from "lucide-react";

// Custom components
import FactCheckList from "../../components/List";
import FormatNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import Template from "../../components/Template";
import Loader from "../../components/Loader";
import SearchInput from "../../components/SearchInput";
import SearchButton from "../../components/SearchButton";
import StatusTabs from "@/components/StatusTabs";
import FiltersPopover from "@/components/FiltersPopover";
import PaginationFooter from "../../components/PaginationFooter";

// Hooks and utils
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";
import getUserPermission from "../../utils/getUserPermission";
import getUrlParams from "../../utils/getUrlParams";
import { getPosts } from "../../actions/posts";
import { useFactCheckFilters } from "./hooks/useFactCheckFilters";
import { useFactCheckData } from "./hooks/useFactCheckData";
import { useFactCheckPagination } from "./hooks/useFactCheckPagination";

// Types
import { FactCheckProps, FilterValues } from "./types";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";

const FactCheck: React.FC<FactCheckProps> = ({ formats }) => {
  const dispatch = useDispatch();
  const { search, pathname } = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { state } = useSidebar();

  // Read the current search query from URL
  const query = new URLSearchParams(search);

  // State
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(!!query.get("q"));

  // Sorting state
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    query.get("sort") === "asc" ? "asc" : "desc"
  );
  const [sortBy, setSortBy] = useState<string>(query.get("sortBy") || "date");

  // Custom hooks
  const { searchText, setSearchText, status, setStatus, filters, form } =
    useFactCheckFilters(query, formats);

  // Get user permissions
  const spaces = useSelector((state: any) => state.spaces);
  const actions = getUserPermission({
    resource: "fact-checks",
    action: "get",
    spaces,
  });

  // Get params for API call
  const keys = [
    "format",
    "page",
    "limit",
    "q",
    "sort",
    "sortBy",
    "tag",
    "category",
    "author",
    "status",
  ];
  const params = getUrlParams(query, keys);

  if (formats && !formats.loading && formats.factcheck) {
    params["format"] = [formats.factcheck.id];
  }

  // Get data and pagination
  const { posts, total, loading, tags, categories, authors } =
    useFactCheckData(params);
  const { totalPages, handlePageChange, handlePageSizeChange } =
    useFactCheckPagination(filters, navigate, pathname, query, total);

  const fetchPosts = () => {
    dispatch(getPosts(params));
  };
  // Fetch posts when URL search params change or formats load
  useEffect(() => {
    fetchPosts();
  }, [search, formats.loading]);

  // If we have search text, make sure search is expanded on mobile
  useEffect(() => {
    if (searchText && isMobile && !isSearchExpanded) {
      setIsSearchExpanded(true);
    }
  }, [searchText, isMobile, isSearchExpanded]);

  // Sorting handlers
  const handleSortToggle = () => {
    const newSort = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSort);

    const newQuery = new URLSearchParams(query.toString());
    newQuery.set("sort", newSort);

    navigate({
      pathname,
      search: "?" + newQuery.toString(),
    });
  };

  const handleSortByChange = (column: string) => {
    // Apply a default order based on the column
    let newSort = sortOrder;
    if (column !== sortBy) {
      // Default date to newest first, default title to alphabetical (A-Z)
      newSort = column === "date" ? "desc" : "asc";
      setSortOrder(newSort);
    }

    setSortBy(column);

    const newQuery = new URLSearchParams(query.toString());
    newQuery.set("sortBy", column);
    newQuery.set("sort", newSort);

    navigate({
      pathname,
      search: "?" + newQuery.toString(),
    });
  };

  // Debounced search function to update URL
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      const newQuery = new URLSearchParams(query.toString());

      if (value.trim()) {
        newQuery.set("q", value);
      } else {
        newQuery.delete("q");
      }

      // Reset page when searching
      newQuery.set("page", "1");

      navigate({
        pathname,
        search: "?" + newQuery.toString(),
      });
    }, 500),
    [pathname, query]
  );

  // Handle search input change with debounce
  const handleSearch = (value) => {
    setSearchText(value);
    debouncedSearch(value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchText("");
    const newQuery = new URLSearchParams(query.toString());
    newQuery.delete("q");

    navigate({
      pathname,
      search: "?" + newQuery.toString(),
    });

    // If on mobile, collapse the search input
    if (isMobile) {
      setIsSearchExpanded(false);
    }
  };

  // Toggle search expansion for mobile
  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };

  // Handle status tab change
  const handleStatusChange = (value: string) => {
    const newQuery = new URLSearchParams(query.toString());

    if (value === "all") {
      newQuery.delete("status");
    } else {
      newQuery.set("status", value);
    }

    // Reset page when changing status
    newQuery.set("page", "1");

    setStatus(value);
    navigate({
      pathname,
      search: "?" + newQuery.toString(),
    });
  };

  // Handle applying filters from the filter popover
  const onSave = (values: FilterValues) => {
    let searchFilter = new URLSearchParams();

    // Preserve existing search text if present
    if (searchText.trim()) {
      searchFilter.set("q", searchText);
    }

    // Add status filter
    if (status !== "all") {
      searchFilter.set("status", status);
    }

    // Add sort and sortBy params
    searchFilter.set("sort", sortOrder);
    searchFilter.set("sortBy", sortBy);

    // Add all other filter values
    Object.entries(values).forEach(([key, value]) => {
      if (value && key !== "q") {
        // Skip "q" as we handle it separately
        if (
          ["format", "tag", "author", "category"].includes(key) &&
          Array.isArray(value)
        ) {
          value.forEach((each) => {
            searchFilter.append(key, each.toString());
          });
        } else {
          if (status !== "all" || key !== "status") {
            searchFilter.set(key, value.toString());
          }
        }
      }
    });

    // Always set format to factcheck format
    if (formats && !formats.loading && formats.factcheck) {
      searchFilter.set("format", formats.factcheck.id.toString());
    }

    navigate({
      pathname,
      search: "?" + searchFilter.toString(),
    });

    // Close the filters popover after applying
    setIsFiltersOpen(false);
  };

  // Check if any filters are applied
  const hasActiveFilters = () => {
    return !!(
      (params.tag && params.tag.length > 0) ||
      (params.category && params.category.length > 0) ||
      (params.author && params.author.length > 0)
    );
  };

  if (formats.loading) {
    return <Loader />;
  }

  if (!formats.factcheck) {
    return (
      <FormatNotFound
        status="info"
        title="Fact-Check format not found"
        link="/settings/advanced/formats/create"
      />
    );
  }

  return (
    <div className="flex flex-col h-full gap-6">
      <Helmet title="Fact-checks" />

      {/* Templates Dialog */}
      <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Templates</DialogTitle>
          </DialogHeader>
          {formats.factcheck && <Template format={formats.factcheck} />}
        </DialogContent>
      </Dialog>

      {/* Header for Mobile */}
      {isMobile ? (
        <div className="space-y-4 flex justify-between items-center">
          {/* First row */}
          {isMobile && (
            <div className="flex flex-col">
              <MobileBreadcrumb
                currentPage="Fact Checks"
                parentLabel="Fact Checking"
              />
              <h1 className="text-xl font-semibold">Fact Checks</h1>
            </div>
          )}
          <div className="flex justify-between items-center gap-2">
            <div>
              <SearchButton onClick={toggleSearch} />
            </div>

            <div className="flex items-center gap-2">
              {/* Templates Button */}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center bg-[#DCEFEB]"
                onClick={() => setTemplatesOpen(true)}
              >
                <span>Templates</span>
              </Button>

              {/* Create Fact-Check Button */}
              <Link to="/fact-checks/create">
                <Button size="sm" className="flex items-center gap-1">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1">
            {/* Search Input - Always visible on desktop */}
            <SearchInput
              searchText={searchText}
              setSearchText={handleSearch}
              handleSearchSubmit={() => {}}
              clearSearch={clearSearch}
            />
          </div>
          <div className="flex items-center gap-4 ">
            {/* Templates Button */}
            <Button
              variant="outline"
              className="flex items-center space-x-1 bg-[#DCEFEB]"
              onClick={() => setTemplatesOpen(true)}
            >
              <span>Explore Templates</span>
            </Button>

            {/* Create Fact-Check Button */}
            <Link to="/fact-checks/create">
              <Button size="lg" className="flex items-center gap-2 py-2">
                <PlusCircle className="h-4 w-4" />
                <span>Create Fact-Check</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
      {/* Search input row - appears when expanded */}
      {isSearchExpanded && (
        <div className="w-full">
          <SearchInput
            searchText={searchText}
            setSearchText={handleSearch}
            handleSearchSubmit={() => {}}
            clearSearch={clearSearch}
            autoFocus={true}
          />
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex-grow max-w-[70%]">
          <StatusTabs
            status={status}
            handleStatusChange={handleStatusChange}
            isMobile={isMobile}
            form={form}
            onSave={onSave}
            children={null} // We moved the children outside the StatusTabs component
          />
        </div>
        <div className="flex items-center">
          {/* Keep only this instance of FiltersPopover, which will be shown in both mobile and desktop views */}
          <FiltersPopover
            form={form}
            isOpen={isFiltersOpen}
            setIsOpen={setIsFiltersOpen}
            onSave={onSave}
            hasActiveFilters={hasActiveFilters()}
          />
        </div>
      </div>
      <FactCheckList
        actions={actions}
        format={formats.factcheck}
        data={{
          posts,
          total,
          loading,
          tags,
          categories,
          authors,
        }}
        filters={{
          ...params,
          sort: sortOrder,
          sortBy: sortBy,
        }}
        fetchPosts={fetchPosts}
        query={status}
        sortOrder={sortOrder}
        onSortToggle={handleSortToggle}
        sortBy={sortBy}
        onSortByChange={handleSortByChange}
      />

      {/* Footer with Pagination */}
      <PaginationFooter
        currentPage={parseInt(params.page || "1", 10)}
        totalPages={totalPages}
        totalItems={total}
        pageSize={parseInt(params.limit || "10", 10)}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default FactCheck;
