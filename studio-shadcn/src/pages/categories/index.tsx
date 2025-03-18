import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import getUrlParams from "../../utils/getUrlParams";

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
  const location = useLocation();
  const navigate = useNavigate();

  // Use URLSearchParams to get the current query parameters
  const query = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const params = useMemo(() => getUrlParams(query), [query]);

  // State for search and filters
  const [searchText, setSearchText] = useState<string>(
    (params.q as string) || ""
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (params.sort as "asc" | "desc") || "desc"
  );
  const [filters, setFilters] = useState<FilterParams>({
    ...params,
    page: parseInt(params.page as string) || 1,
    limit: parseInt(params.limit as string) || 10,
  });

  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);

  // Detect mobile screen on mount
  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const searchParams = new URLSearchParams();

    // Only add non-empty values to the search params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        // Don't add default pagination values to URL
        if (
          (key === "page" && value === 1) ||
          (key === "limit" && value === 10)
        ) {
          return;
        }
        searchParams.set(key, String(value));
      }
    });

    const searchParamsString = searchParams.toString();
    const newUrl =
      location.pathname + (searchParamsString ? `?${searchParamsString}` : "");

    // Only navigate if the URL actually changed to avoid loops
    const currentFullPath = location.pathname + location.search;

    if (currentFullPath !== newUrl) {
      navigate(newUrl, { replace: true });
    }
  }, [filters, navigate, location.pathname, location.search]);

  // Fetch categories when component mounts or URL params change
  useEffect(() => {
    dispatch(getCategories(params));
  }, [dispatch, location.search, params]);

  // Get data from Redux store
  const { categories, total, loading } = useSelector((state: RootState) => {
    const node = state.categories.req.find((item) => {
      return deepEqual(item.query, params);
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

  const fetchCategories = useCallback(() => {
    dispatch(getCategories(params));
  }, [dispatch, params]);

  // Handle search input changes - dynamic search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Handle sort toggle
  const handleSortToggle = useCallback(() => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    setFilters({
      ...filters,
      sort: newSortOrder,
    });
  }, [sortOrder, filters]);

  // Update filter parameters
  const updateFilterParams = (newParams: Record<string, any>) => {
    setFilters({
      ...filters,
      ...newParams,
    });
  };

  return loading ? (
    <Loader />
  ) : (
    <div className="flex flex-col space-y-4 w-full">
      <Helmet title={"Categories"} />

      <div className="w-full">
        <div className="flex flex-row md:flex-row justify-between gap-4">
          <div className="relative w-64">
            <Input
              placeholder="Search categories..."
              value={searchText}
              onChange={handleSearchChange}
              className="pr-10"
            />
          </div>

          <div className="w-full md:w-1/3">
            <div
              className={`flex items-center gap-4 ${
                isMobileScreen
                  ? "justify-between flex-row-reverse"
                  : "justify-end"
              }`}
            >
              <div
                className={`${isMobileScreen ? "w-1/2" : "w-full md:w-auto"}`}
              >
                <div className="flex justify-end">
                  <Link to="/categories/create">
                    <Button
                      variant="default"
                      className="flex items-center gap-2"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Create category
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col min-h-0">
        <CategoryList
          data={{
            categories: filteredCategories,
            total: filteredCategories.length,
            loading,
          }}
          filters={filters}
          setFilters={updateFilterParams}
          fetchCategories={fetchCategories}
          sortOrder={sortOrder}
          onSortToggle={handleSortToggle}
        />
      </div>
    </div>
  );
}

export default Categories;
