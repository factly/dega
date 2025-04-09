import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import deepEqual from "deep-equal";
import { PlusCircle, Search as SearchIcon } from "lucide-react";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CategoryList from "./components/CategoryList";
import Loader from "../../components/Loader";
import { getCategories } from "../../actions/categories";
import Pagination from "../../components/Pagination";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
import SecuredButton from "@/components/SecuredButton";

interface Category {
  id: string;
  [key: string]: any;
}

interface CategoryState {
  req: Array<{
    query: Record<string, any>;
    data: string[];
    total: number;
  }>;
  details: Record<string, Category>;
  loading: boolean;
}

interface RootState {
  categories: CategoryState;
  sidebar: {
    collapsed: boolean;
  };
}

interface FilterParams {
  q?: string;
  sort?: string;
  page?: number;
  limit?: number;
  [key: string]: string | number | undefined;
}

function Categories() {
  const dispatch = useAppDispatch();
  const { state: sidebarState } = useSidebar();
  const isMobile = useIsMobile();

  // State for search and filters
  const [searchText, setSearchText] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(!isMobile);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Initialize filters with a ref to prevent unnecessary reloads
  const [filters, setFilters] = useState<FilterParams>({
    page: 1,
    limit: 10, // Use a consistent value initially
  });

  // Handle responsive UI changes without triggering data reload
  useEffect(() => {
    // Just update the UI state for search visibility
    setShowSearch(!isMobile);

    // We don't update filters.limit here anymore to prevent data reload
  }, [isMobile]);

  // Fetch categories only when filters are intentionally changed
  useEffect(() => {
    fetchCategories();
  }, [filters]);

  // Get data from Redux store
  const { categories, total, loading } = useSelector((state: RootState) => {
    // Adjust the query to match current device type for proper cache lookup
    const adjustedQuery = {
      ...filters,
    };

    const node = state.categories.req.find((item) => {
      return deepEqual(item.query, adjustedQuery);
    });

    if (node)
      return {
        categories: node.data.map(
          (element) => state.categories.details[element]
        ),
        total: node.total,
        loading: state.categories.loading,
      };
    return { categories: [], total: 0, loading: state.categories.loading };
  });

  // Filter categories locally based on search text
  const filteredCategories = useMemo(() => {
    if (!searchText.trim()) {
      return categories;
    }

    return categories.filter(
      (category) =>
        category.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        category.slug?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [categories, searchText]);

  // Sort categories based on sort order
  const sortedCategories = useMemo(() => {
    return [...filteredCategories].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name?.localeCompare(b.name || "") || 0;
      } else {
        return b.name?.localeCompare(a.name || "") || 0;
      }
    });
  }, [filteredCategories, sortOrder]);

  const fetchCategories = useCallback(() => {
    dispatch(getCategories(filters));
  }, [dispatch, filters]);

  // Handle search input changes - dynamic search
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

  // Handle navigation to create category page
  const handleCreateCategory = () => {
    window.location.href = "/categories/create";
  };

  const pageSize = filters.limit || 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const isCollapsed = sidebarState === "collapsed" && !isMobile;

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col h-full">
      <Helmet title={"Categories"} />

      {/* Mobile Breadcrumb */}
      {isMobile && (
        <MobileBreadcrumb
          currentPage="Categories"
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
            isMobile ? "pb-3" : "px-4 pr-5 h-full"
          }`}
        >
          {/* Title */}
          {isMobile && <h1 className="text-xl font-semibold">Categories</h1>}

          {/* Desktop search bar */}
          {!isMobile && (
            <div className="flex-1 max-w-xs">
              <Input
                placeholder="Search categories..."
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

            {isMobile ? (
              <SecuredButton 
                className="h-9 w-9"
                size="icon"
                onClick={handleCreateCategory}
                unauthorizedMessage="You need admin privileges to create categories."
              >
                <PlusCircle className="h-5 w-5" />
              </SecuredButton>
            ) : (
              <SecuredButton 
                className="flex items-center gap-2 py-2"
                size="lg"
                onClick={handleCreateCategory}
                unauthorizedMessage="You need admin privileges to create categories."
              >
                <PlusCircle className="h-4 w-4" />
                Create category
              </SecuredButton>
            )}
          </div>
        </div>

        {/* Mobile search bar */}
        {isMobile && showSearch && (
          <div className="px-4 pb-3">
            <Input
              placeholder="Search categories..."
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
        <CategoryList
          data={{
            categories: sortedCategories,
            total: total,
            loading,
          }}
          filters={filters}
          setFilters={setFilters}
          fetchCategories={fetchCategories}
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

export default Categories;