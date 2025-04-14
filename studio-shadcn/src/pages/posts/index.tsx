import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import { useAppDispatch } from "@/hooks/reduxHooks";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";

// Local Components
import PostList from "@/components/List";
import FormatNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import Loader from "../../components/Loader";
import Template from "../../components/Template";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";

// Custom Components
import SearchInput from "../../components/SearchInput";
import SearchButton from "@/components/SearchButton";
import FiltersPopover from "@/components/FiltersPopover";
import StatusTabs from "@/components/StatusTabs";
import PaginationFooter from "@/components/PaginationFooter";

// Utils and actions
import getUrlParams from "../../utils/getUrlParams";
import { getPosts } from "../../actions/posts";
import { usePagination } from "./hooks/usePagination";
import { usePostFilters } from "./hooks/usePostFilters";
import { usePostData } from "./hooks/usePostData";

// Types
import { Format, FormatState, PostsProps, FilterParams } from "./types";

function Posts({ formats }: PostsProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const { search, pathname } = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(search);
  const isMobile = useIsMobile();
  const initialRenderRef = useRef(true);

  // State
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(!!query.get("q"));
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Check localStorage for cached format on initial render only
  // Use ref to avoid state updates during render
  const hasCachedFormatRef = useRef(false);

  useEffect(() => {
    if (initialRenderRef.current) {
      try {
        const savedFormats = localStorage.getItem("cachedFormats");
        if (savedFormats) {
          const parsedFormats = JSON.parse(savedFormats);
          if (parsedFormats.article) {
            hasCachedFormatRef.current = true;
          }
        }
      } catch (error) {
        console.error("Error checking cached formats:", error);
      }
      initialRenderRef.current = false;
    }
  }, []);

  // Custom hooks for post functionality
  const {
    filters,
    setFilters,
    searchText,
    setSearchText,
    status,
    setStatus,
    form,
  } = usePostFilters(query);

  const { posts, total, loading, tags, categories, authors } =
    usePostData(query);

  const { handlePageChange, handlePageSizeChange, totalPages, onPagination } =
    usePagination(filters, setFilters, total, navigate, pathname, query);


  // Sorting state
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    query.get("sort") === "asc" ? "asc" : "desc"
  );
  const [sortBy, setSortBy] = useState<string>(query.get("sortBy") || "date");

  // If we have search text, make sure search is expanded on mobile
  useEffect(() => {
    if (searchText && isMobile && !isSearchExpanded) {
      setIsSearchExpanded(true);
    }
  }, [searchText, isMobile, isSearchExpanded]);

  // Fetch posts when search changes
  useEffect(() => {
    fetchPosts();
  }, [search]);

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    // If formats are loading, set a timeout to continue rendering anyway
    if (formats.loading) {
      timeoutRef.current = window.setTimeout(() => {
        setLoadingTimeout(true);
      }, 5000); // 5 seconds timeout
    } else {
      setLoadingTimeout(false);
    }

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [formats.loading]);

  const fetchPosts = () => {
    const params = getUrlParams(query, [
      "page",
      "limit",
      "q",
      "sort",
      "sortBy",
      "tag",
      "category",
      "author",
      "status",
    ]);

    dispatch(getPosts(params));
  };

  // Handler functions
  const handleSearchSubmit = () => {
    const newQuery = new URLSearchParams(query.toString());

    if (searchText.trim()) {
      newQuery.set("q", searchText);
    } else {
      newQuery.delete("q");
    }

    // Reset page when searching
    newQuery.set("page", "1");

    navigate({
      pathname,
      search: "?" + newQuery.toString(),
    });
  };

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

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };

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

  const onSave = (values: FilterParams) => {
    const searchFilter = new URLSearchParams();

    // Preserve search text if present
    if (searchText.trim()) {
      searchFilter.set("q", searchText);
    }

    // Add status filter
    if (status !== "all") searchFilter.set("status", status);

    // Add sort and sortBy params
    searchFilter.set("sort", sortOrder);
    searchFilter.set("sortBy", sortBy);

    Object.keys(values).forEach((key) => {
      if (values[key]) {
        if (
          key === "format" ||
          key === "tag" ||
          key === "author" ||
          key === "category"
        ) {
          (values[key] as string[]).forEach((each) => {
            searchFilter.append(key, each);
          });
        } else {
          if (values.status !== "all")
            searchFilter.set(key, values[key] as string);
        }
      }
    });

    if (formats && !formats.loading && formats.article) {
      searchFilter.set("format", (formats.article.id).toString());
    }

    navigate({
      pathname: pathname,
      search: "?" + searchFilter.toString(),
    });
  };

  // Continue rendering even if formats.loading is true but we've waited too long
  // This prevents infinite loading screens
  const shouldContinueRendering =
    !formats.loading || loadingTimeout || hasCachedFormatRef.current;

  // Loading state - show for a maximum of 5 seconds
  if (formats.loading && !loadingTimeout && !hasCachedFormatRef.current) {
    return <Loader />;
  }

  // Format not found state - but only check if we're sure formats are loaded or timeout occurred
  if (
    shouldContinueRendering &&
    !formats.article &&
    !hasCachedFormatRef.current
  ) {
    return (
      <FormatNotFound
        status="info"
        title="Article format not found"
        link="/settings/advanced/formats/create"
      />
    );
  }

  return (
    <div className="flex flex-col h-full gap-6">
      <Helmet title="Posts" />

      {/* Templates Dialog */}
      <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Templates</DialogTitle>
          </DialogHeader>
          {formats.article && <Template format={formats.article} />}
        </DialogContent>
      </Dialog>

      {/* Header for Mobile */}
      {isMobile ? (
        <div className="space-y-4 flex justify-between items-center">
          {/* Breadcrumb */}
          <div className="flex flex-col">
            <MobileBreadcrumb currentPage="Posts" parentLabel="Core" />
            <h1 className="text-xl font-semibold">Posts</h1>
          </div>
          <div className="flex gap-2 items-center">
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

              {/* Create Post Button */}
              <Link to="/posts/create">
                <Button size="sm" className="flex items-center gap-1">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Header */
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1">
            {/* Search Input - Always visible on desktop */}
            <SearchInput
              searchText={searchText}
              setSearchText={setSearchText}
              handleSearchSubmit={handleSearchSubmit}
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

            {/* Create Post Button */}
            <Link to="/posts/create">
              <Button size="lg" className="flex items-center gap-2 py-2">
                <PlusCircle className="h-4 w-4" />
                <span>Create Post</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
      {/* Search input row - appears when expanded */}
      {isSearchExpanded && isMobile && (
        <div className="w-full">
          <SearchInput
            searchText={searchText}
            setSearchText={setSearchText}
            handleSearchSubmit={handleSearchSubmit}
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
          <FiltersPopover form={form} onSave={onSave} />
        </div>
      </div>
      <PostList
        format={formats.article}
        data={{ posts, total, loading, tags, categories, authors }}
        filters={{
          ...filters,
          sort: sortOrder,
          sortBy: sortBy,
        }}
        onPagination={onPagination}
        fetchPosts={fetchPosts}
        sortOrder={sortOrder}
        onSortToggle={handleSortToggle}
        sortBy={sortBy}
        onSortByChange={handleSortByChange}
      />
      {/* Footer with Pagination */}
      <PaginationFooter
        currentPage={Number(filters.page) || 1}
        totalPages={totalPages}
        totalItems={total}
        pageSize={Number(filters.limit) || 10}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}

export default Posts;
