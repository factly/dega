// index.tsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { PlusCircle, Search as SearchIcon } from "lucide-react";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Custom components
import CategoryList from "./components/CategoryList";
import Loader from "@/components/Loader";
import PaginationFooter from "@/components/PaginationFooter";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
// Actions and hooks
import { getCategories } from "../../actions/categories";
import { useCategoriesData } from "./hooks/useCategoriesData";
import { useCategoriesPagination } from "./hooks/useCategoriesPagination";
import { CategoryFilters } from "./types";
import { useSidebar } from "@/components/ui/sidebar";
import SecuredButton from "@/components/SecuredButton";

function Categories() {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const { state: sidebarState } = useSidebar();
  const [searchText, setSearchText] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(!isMobile);
  const [filters, setFilters] = useState<CategoryFilters>({
    page: 1,
    limit: 10,
  });

  // Handle responsive UI changes
  useEffect(() => {
    setIsSearchExpanded(!isMobile);
  }, [isMobile]);

  // Fetch initial data
  useEffect(() => {
    dispatch(getCategories(filters));
  }, [dispatch, filters]);

  // Use custom hooks
  const { categories, total, loading } = useCategoriesData(filters, searchText);
  const { totalPages, handlePageChange, handlePageSizeChange, onPagination } =
    useCategoriesPagination(filters, setFilters, total);

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (isSearchExpanded) {
      setSearchText("");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleCreateCategory = () => {
    window.location.href = "/categories/create";
  };

  const isCollapsed = sidebarState === "collapsed" && !isMobile;

  if (loading) {
    return (
      <div className="flex flex-col h-full relative">
        <Helmet title={"Categories"} />
        {isMobile && (
          <MobileBreadcrumb currentPage="Categories" parentLabel="Core" />
        )}
        <div className="flex-1 flex items-center justify-center">
          <Loader className="relative inset-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Helmet title="Categories" />

      {/* Mobile Breadcrumb */}
      {isMobile && (
        <MobileBreadcrumb currentPage="Categories" parentLabel="Core" />
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
              >
                <PlusCircle className="h-5 w-5" />
              </SecuredButton>
            ) : (
              <SecuredButton
                className="flex items-center gap-2 py-2"
                size="lg"
                onClick={handleCreateCategory}
              >
                <PlusCircle className="h-4 w-4" />
                Create category
              </SecuredButton>
            )}
          </div>
        </div>

        {/* Mobile search bar */}
        {isMobile && isSearchExpanded && (
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
            categories,
            total,
            loading,
          }}
          filters={{
            page: filters.page,
            limit: filters.limit,
          }}
          setFilters={setFilters}
          fetchCategories={() => dispatch(getCategories(filters))}
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
        <PaginationFooter
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
