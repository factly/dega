import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import deepEqual from "deep-equal";
import { PlusCircle } from "lucide-react";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CategoryList from "./components/CategoryList";
import Loader from "../../components/Loader";
import { getCategories } from "../../actions/categories";
import Pagination from "../../components/Pagination";

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

  // State for search and filters
  const [searchText, setSearchText] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<FilterParams>({
    page: 1,
    limit: 10,
  });

  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);

  // Fetch categories when filters change
  useEffect(() => {
    fetchCategories();
  }, [filters]);

  // Get data from Redux store
  const { categories, total, loading } = useSelector((state: RootState) => {
    const node = state.categories.req.find((item) => {
      return deepEqual(item.query, filters);
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

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  // Get sidebar state from Redux store
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar?.collapsed
  );

  // Calculate left margin based on sidebar state
  const sidebarWidth = isCollapsed ? "89px" : "265px";

  // Define the header height (including padding)
  const headerHeight = "calc(1.5rem + 2.5rem + 1rem)"; // top padding + height + bottom padding

  return loading ? (
    <Loader />
  ) : (
    <div className="flex flex-col h-full">
      <Helmet title={"Categories"} />

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
                placeholder="Search categories..."
                value={searchText}
                onChange={handleSearchChange}
                className="h-10"
              />
            </div>
          </div>
          <div>
            <Link to="/categories/create">
              <Button size="lg" className="flex items-center gap-2 py-2">
                <PlusCircle className="h-4 w-4" />
                Create category
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

export default Categories;
