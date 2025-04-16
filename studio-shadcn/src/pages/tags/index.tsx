// index.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { PlusCircle } from "lucide-react";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
// Custom components
import TagList from "./components/TagList";
import Loader from "@/components/Loader";
import SearchInput from "@/components/SearchInput";
import PaginationFooter from "@/components/PaginationFooter";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
import SearchButton from "@/components/SearchButton";
// Actions and hooks
import { getTags } from "../../actions/tags";
import { useForm } from "react-hook-form";
import { useTagsData } from "./hooks/useTagsData";
import { useTagsPagination } from "./hooks/useTagsPagination";
import { TagFilters, FormValues } from "./types";
import { useSidebar } from "@/components/ui/sidebar";

function Tags() {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const { state: sidebarState } = useSidebar();
  const [searchText, setSearchText] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [filters, setFilters] = useState<TagFilters>({
    page: 1,
    limit: 10,
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
    },
  });

  // Fetch initial data
  useEffect(() => {
    dispatch(getTags(filters));
  }, [dispatch, filters]);

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };

  // Use custom hooks
  const { tags, total, loading } = useTagsData(filters, searchText);
  const { totalPages, handlePageChange, handlePageSizeChange, onPagination } =
    useTagsPagination(filters, setFilters, total);

  const clearSearch = () => {
    setSearchText("");
  };

  const onSave = (values: FormValues) => {
    // Update local state with form values
    setFilters({
      ...filters,
      page: 1, // Reset to page 1 when applying new filters
    });
    setIsFiltersOpen(false);
  };

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

  return (
    <div className="flex flex-col h-full gap-6">
      <Helmet title="Tags" />

      {/* Header */}
      {isMobile ? (
        <div className="space-y-4 flex justify-between items-center">
          {isMobile && (
            <div className="flex flex-col">
              <MobileBreadcrumb currentPage="Tags" parentLabel="Core" />
              {isMobile && <h1 className="text-xl font-semibold">Tags</h1>}
            </div>
          )}
          <div className="flex gap-2 items-center">
            <div>
              <SearchButton onClick={toggleSearch} />
            </div>
            <div className="flex items-center gap-2 ml-2">
              <Link to="/tags/create">
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
          <Link to="/tags/create">
            <Button size="lg" className="flex items-center gap-2 py-2">
              <PlusCircle className="h-4 w-4" />
              <span>Create Tag</span>
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
        <TagList
          data={{
            tags,
            total,
            loading,
          }}
          filters={{
            page: filters.page,
            limit: filters.limit,
          }}
          fetchTags={() => dispatch(getTags(filters))}
          onPagination={onPagination}
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

export default Tags;
