import React, { useEffect, useState, useMemo, useCallback } from "react";
import TagList from "./components/TagList";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import deepEqual from "deep-equal";
import { Helmet } from "react-helmet";
import { RootState } from "../../store/index";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search as SearchIcon } from "lucide-react";
import { getTags } from "../../actions/tags";
import Loader from "../../components/Loader";
import { useAppDispatch } from "@/hooks/reduxHooks";
import Pagination from "../../components/Pagination";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
import SecuredButton from "@/components/SecuredButton";

interface FilterParams {
  q?: string;
  sort?: string;
  page?: number;
  limit?: number;
  [key: string]: string | number | undefined;
}

interface TagNode {
  query: FilterParams;
  data: number[];
  total: number;
}

function Tags(): React.ReactElement {
  const dispatch = useAppDispatch();
  const { state: sidebarState } = useSidebar();
  const isMobile = useIsMobile();

  // State for search and filters
  const [searchText, setSearchText] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(!isMobile);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Initialize filters with a state to prevent unnecessary reloads
  const [filters, setFilters] = useState<FilterParams>({
    page: 1,
    limit: 10,
  });

  // Handle responsive UI changes
  useEffect(() => {
    setShowSearch(!isMobile);
  }, [isMobile]);

  // Fetch tags when filters change - key improvement from categories page
  useEffect(() => {
    fetchTags();
  }, [filters]);

  // Get data from Redux store
  const { tags, total, loading } = useSelector((state: RootState) => {
    // Ensure state.tags and state.tags.req exist
    if (!state.tags || !state.tags.req) {
      return { tags: [], total: 0, loading: false };
    }

    // Adjust the query to match current filters for proper cache lookup
    const node = (state.tags.req as TagNode[]).find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node && state.tags.details) {
      // Make sure data is available and mapped correctly
      const tagData = node.data
        .filter((id) => state.tags.details && state.tags.details[id])
        .map((element) => state.tags.details[element]);

      return {
        tags: tagData,
        total: node.total,
        loading: state.tags.loading || false,
      };
    }
    return { tags: [], total: 0, loading: state.tags.loading || false };
  });

  // Filter tags locally based on search text
  const filteredTags = useMemo(() => {
    if (!searchText.trim()) {
      return tags;
    }

    return tags.filter((tag: any) => {
      const searchLower = searchText.toLowerCase();
      const nameMatch =
        typeof tag.name === "string"
          ? tag.name.toLowerCase().includes(searchLower)
          : false;

      const descriptionMatch =
        typeof tag.description === "string"
          ? tag.description.toLowerCase().includes(searchLower)
          : false;

      const slugMatch =
        typeof tag.slug === "string"
          ? tag.slug.toLowerCase().includes(searchLower)
          : false;

      return nameMatch || descriptionMatch || slugMatch;
    });
  }, [tags, searchText]);

  // Sort tags based on sort order
  const sortedTags = useMemo(() => {
    return [...filteredTags].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name?.localeCompare(b.name || "") || 0;
      } else {
        return b.name?.localeCompare(a.name || "") || 0;
      }
    });
  }, [filteredTags, sortOrder]);

  const fetchTags = useCallback(() => {
    dispatch(getTags(filters));
  }, [dispatch, filters]);

  const handleSortToggle = useCallback(() => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, q: searchText, page: 1 }));

    // Update URL for shareable links, but don't depend on it for data fetching
    updateURLParams({ q: searchText, page: 1 });
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
    updateURLParams({ page });
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setFilters((prev) => ({ ...prev, limit: size, page: 1 }));
    updateURLParams({ limit: size, page: 1 });
  }, []);

  // URL params update function - now decoupled from data fetching
  const updateURLParams = useCallback((newParams: Record<string, any>) => {
    const searchParams = new URLSearchParams(window.location.search);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (
          (key === "page" && value === 1) ||
          (key === "limit" && value === 10)
        ) {
          searchParams.delete(key);
        } else {
          searchParams.set(key, String(value));
        }
      } else {
        searchParams.delete(key);
      }
    });

    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`
    );
  }, []);

  // Calculate total pages
  const pageSize = filters.limit || 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const isCollapsed = sidebarState === "collapsed" && !isMobile;

  if (loading) {
    return (
      <div className="flex flex-col h-full relative">
        <Helmet title={"Tags"} />
        {isMobile && <MobileBreadcrumb currentPage="Tags" parentLabel="Core" />}
        <div className="flex-1 flex items-center justify-center">
          <Loader className="relative inset-auto" />
        </div>
      </div>
    );
  }

  // Handle navigation to create tag page
  const handleCreateTag = () => {
    window.location.href = "/tags/create";
  };

  return (
    <div className="flex flex-col h-full">
      <Helmet title={"Tags"} />

      {/* Mobile Breadcrumb */}
      {isMobile && <MobileBreadcrumb currentPage="Tags" parentLabel="Core" />}

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
          {isMobile && <h1 className="text-xl font-semibold">Tags</h1>}

          {/* Desktop search bar */}
          {!isMobile && (
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-4 flex-1"
            >
              <div className="relative flex-1 max-w-xs">
                <Input
                  placeholder="Search tags..."
                  value={searchText}
                  onChange={handleSearchChange}
                  className="h-10"
                />
              </div>
            </form>
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
                onClick={handleCreateTag}
              >
                <PlusCircle className="h-5 w-5" />
              </SecuredButton>
            ) : (
              <SecuredButton
                className="flex items-center gap-2 py-2"
                size="lg"
                onClick={handleCreateTag}
              >
                <PlusCircle className="h-4 w-4" />
                Create tag
              </SecuredButton>
            )}
          </div>
        </div>

        {/* Mobile search bar */}
        {isMobile && showSearch && (
          <div className="px-4 pb-3">
            <form onSubmit={handleSearchSubmit}>
              <Input
                placeholder="Search tags..."
                value={searchText}
                onChange={handleSearchChange}
                className="h-9 w-full"
                autoFocus
              />
            </form>
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
        <TagList
          data={{
            tags: sortedTags,
            total: total,
            loading,
          }}
          filters={filters}
          setFilters={(newParams) => {
            setFilters((prev) => ({ ...prev, ...newParams }));
            updateURLParams(newParams);
          }}
          fetchTags={fetchTags}
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
          currentPage={filters.page || 1}
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

export default Tags;
