// Main Pages Component
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import PageList from "./components/PageList";
import FormatNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import Loader from "../../components/Loader";
import Template from "../../components/Template";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
import SecuredButton from "@/components/SecuredButton";

// Custom Components
import FiltersPopover from "@/components/FiltersPopover";
import StatusTabs from "@/components/StatusTabs";
import PaginationFooter from "@/components/PaginationFooter";

// Utils and actions
import getUrlParams from "../../utils/getUrlParams";
import { getPages } from "../../actions/pages";
import { usePagination } from "./hooks/usePagination";
import { usePageFilters } from "./hooks/usePageFilters";
import { usePageData } from "./hooks/usePageData";

// Types
import { Format, FormatState, PagesProps, FilterParams } from "./types";

function Pages({ formats }: PagesProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const { search, pathname } = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(search);
  const isMobile = useIsMobile();
  const initialRenderRef = useRef(true);

  // State
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const [cachedFormat, setCachedFormat] = useState<Format | undefined>(
    undefined
  );

  // Use ref to avoid state updates during render
  const hasCachedFormatRef = useRef(false);

  // Check localStorage for cached format on initial render
  useEffect(() => {
    if (initialRenderRef.current) {
      try {
        const savedFormats = localStorage.getItem("cachedFormats");
        if (savedFormats) {
          const parsedFormats = JSON.parse(savedFormats);
          setCachedFormat(parsedFormats.article);
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

  // Custom hooks for page functionality
  const { filters, setFilters, status, setStatus, form } =
    usePageFilters(query);

  const { pages, total, loading, tags, categories } = usePageData(query);

  const { handlePageChange, handlePageSizeChange, totalPages, onPagination } =
    usePagination(filters, setFilters, total, navigate, pathname, query);

  // Fetch pages when search changes
  useEffect(() => {
    fetchPages();
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

  const fetchPages = () => {
    const params = getUrlParams(query, [
      "page",
      "limit",
      "sortBy",
      "tag",
      "category",
      "author",
      "status",
    ]);

    dispatch(getPages(params));
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

  const handleSortByChange = (column: string) => {
    setSortBy(column);

    const newQuery = new URLSearchParams(query.toString());
    newQuery.set("sortBy", column);

    navigate({
      pathname,
      search: "?" + newQuery.toString(),
    });
  };

  // Keep sortBy state for column sorting
  const [sortBy, setSortBy] = useState<string>(query.get("sortBy") || "date");

  const onSave = (values: FilterParams) => {
    const searchFilter = new URLSearchParams();

    // Add status filter
    if (status !== "all") searchFilter.set("status", status);

    // Add sortBy param
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
      searchFilter.set("format", String(formats.article.id));
    }

    navigate({
      pathname: pathname,
      search: "?" + searchFilter.toString(),
    });
  };

  // Handle navigation to create page
  const handleCreatePage = () => {
    navigate("/pages/create");
  };

  const shouldContinueRendering =
    !formats.loading || loadingTimeout || hasCachedFormatRef.current;

  // Loading state - show for a maximum of 5 seconds
  if (formats.loading && !loadingTimeout && !hasCachedFormatRef.current) {
    return (
      <div className="flex flex-col h-full relative">
        <Helmet title="Pages" />
        {isMobile && (
          <MobileBreadcrumb currentPage="Pages" parentLabel="Core" />
        )}
        <div className="flex-1 flex items-center justify-center">
          <Loader className="relative inset-auto" />
        </div>
      </div>
    );
  }
  const formatToUse = formats.article || cachedFormat;

  // Format not found state - but only check if we're sure formats are loaded or timeout occurred
  if (!formatToUse) {
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
      <Helmet title="Pages" />

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
          {/* First row */}
          {isMobile && (
            <div className="flex flex-col">
              <MobileBreadcrumb currentPage="Pages" parentLabel="Core" />
              {isMobile && <h1 className="text-xl font-semibold">Pages</h1>}
            </div>
          )}
          <div className="flex gap-2 items-center">
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

              <SecuredButton
                size="sm"
                className="flex items-center gap-1"
                onClick={handleCreatePage}
              >
                <PlusCircle className="h-4 w-4" />
              </SecuredButton>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Header */
        <div className="flex justify-between items-center">
          <div className="flex-1"></div>
          <div className="flex items-center gap-4 ">
            {/* Templates Button */}
            <Button
              variant="outline"
              className="flex items-center space-x-1 bg-[#DCEFEB]"
              onClick={() => setTemplatesOpen(true)}
            >
              <span>Explore Templates</span>
            </Button>

            <SecuredButton
              size="lg"
              className="flex items-center gap-2 py-2"
              onClick={handleCreatePage}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Page</span>
            </SecuredButton>
          </div>
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
      <PageList
        format={formatToUse}
        // @ts-expect-error TODO: Fix this type error
        data={{ pages, total, loading, tags, categories }}
        filters={{
          ...filters,
          sortBy: sortBy,
        }}
        onPagination={onPagination}
        fetchPages={fetchPages}
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

export default Pages;
