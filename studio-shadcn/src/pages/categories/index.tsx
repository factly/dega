// index.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { PlusCircle } from "lucide-react";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
// Custom components
import CategoryList from "./components/CategoryList";
import Loader from "@/components/Loader";
import SearchInput from "@/components/SearchInput";
import FiltersPopover from "./components/FiltersPopover";
import PaginationFooter from "@/components/PaginationFooter";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
import SearchButton from "@/components/SearchButton";
// Actions and hooks
import { getCategories } from "../../actions/categories";
import { useForm } from "react-hook-form";
import { useCategoriesData } from "./hooks/useCategoriesData";
import { useCategoriesPagination } from "./hooks/useCategoriesPagination";
import { CategoryFilters, FormValues } from "./types";
import { useSidebar } from "@/components/ui/sidebar";

function Categories() {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const { state: sidebarState } = useSidebar();
  const [searchText, setSearchText] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [filters, setFilters] = useState<CategoryFilters>({
    page: 1,
    limit: 10,
    sort: "desc",
  });

  useEffect(() => {
    if (searchText && isMobile && !isSearchExpanded) {
      setIsSearchExpanded(true);
    }
  }, [searchText, isMobile, isSearchExpanded]);

  // Initialize form
  const form = useForm<FormValues>({
    defaultValues: {
      q: "",
      sort: filters.sort,
    },
  });

  // Fetch initial data
  useEffect(() => {
    dispatch(getCategories(filters));
  }, [dispatch, filters]);

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };

  // Use custom hooks
  const { categories, total, loading } = useCategoriesData(filters, searchText);
  const { totalPages, handlePageChange, handlePageSizeChange, onPagination } =
    useCategoriesPagination(filters, setFilters, total);

  const clearSearch = () => {
    setSearchText("");
  };

  const onSave = (values: FormValues) => {
    // Update local state with form values
    setFilters({
      ...filters,
      page: 1, // Reset to page 1 when applying new filters
      sort: values.sort || "desc",
    });
    setIsFiltersOpen(false);
  };

  const handleSortToggle = () => {
    setFilters({
      ...filters,
      sort: filters.sort === "asc" ? "desc" : "asc",
    });
  };

  // Check if any filters are applied
  const hasActiveFilters = () => {
    return !!(filters.sort !== "desc");
  };

  const isCollapsed = sidebarState === "collapsed" && !isMobile;

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col h-full gap-6">
      <Helmet title="Categories" />

      {/* Header */}
      {isMobile ? (
        <div className="space-y-4 flex justify-between items-center">
          {isMobile && (
            <div className="flex flex-col">
              <MobileBreadcrumb
                currentPage="Categories"
                parentLabel="Core"
              />
              {isMobile && <h1 className="text-xl font-semibold">Categories</h1>}
            </div>
          )}
          <div className="flex gap-2 items-center">
            <div>
              <SearchButton onClick={toggleSearch} />
            </div>
            <div className="flex items-center gap-2 ml-2">
              <Link to="/categories/create">
                <Button size="sm" className="flex items-center">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1">
            <SearchInput
              searchText={searchText}
              setSearchText={setSearchText}
              handleSearchSubmit={() => {}}
              clearSearch={clearSearch}
              autoFocus={false}
            />
          </div>
          <Link to="/categories/create">
            <Button size="lg" className="flex items-center gap-2 py-2">
              <PlusCircle className="h-4 w-4" />
              <span>Create Category</span>
            </Button>
          </Link>
        </div>
      )}
      {isSearchExpanded && isMobile && (
        <div className="w-full">
          <SearchInput
            searchText={searchText}
            setSearchText={setSearchText}
            handleSearchSubmit={() => {}}
            clearSearch={clearSearch}
            autoFocus={true}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-scroll">
        <CategoryList
          data={{
            categories,
            total,
            loading,
          }}
          filters={{
            page: filters.page,
            limit: filters.limit,
          }}
          fetchCategories={() => dispatch(getCategories(filters))}
          onPagination={onPagination}
          sortOrder={filters.sort as "asc" | "desc"}
          onSortToggle={handleSortToggle}
          isMobile={isMobile}
        />
      </div>

      {/* Footer with Pagination */}
      <PaginationFooter
        currentPage={filters.page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={filters.limit}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}

export default Categories;
