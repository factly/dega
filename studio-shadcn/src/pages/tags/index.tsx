/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useMemo, useCallback } from "react";
import TagList from "./components/TagList";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import deepEqual from "deep-equal";
import { Helmet } from "react-helmet";
import { RootState } from "../../store/index";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getTags } from "../../actions/tags";
import getUrlParams from "../../utils/getUrlParams";
import Loader from "../../components/Loader";
import Filters from "../../utils/filters";
import { useAppDispatch } from "@/hooks/reduxHooks";
import Pagination from "../../components/Pagination";

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

interface TagsState {
  tags: {
    req: TagNode[];
    details: Record<number, any>;
    loading: boolean;
  };
}

function Tags(): React.ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [searchText, setSearchText] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Use useMemo to get URL params to avoid re-calculations
  const urlParams = useMemo(
    () => getUrlParams(new URLSearchParams(location.search)),
    [location.search]
  );

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterParams>({
    ...urlParams,
    page: parseInt(urlParams.page as string) || 1,
    limit: parseInt(urlParams.limit as string) || 10,
  });

  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);

  // Detect mobile screen
  useEffect(() => {
    setIsMobileScreen(window.innerWidth <= 768);
  }, []);

  // Initialize search text from URL if present
  useEffect(() => {
    if (urlParams.q) {
      setSearchText(urlParams.q as string);
    }
  }, [urlParams.q]);

  const form = React.useRef<HTMLFormElement>(null);

  // Get data from Redux using the URL parameters directly
  const { tags, total, loading } = useSelector((state: RootState) => {
    // Ensure state.tags and state.tags.req exist
    if (!state.tags || !state.tags.req) {
      return { tags: [], total: 0, loading: false };
    }

    const node = (state.tags.req as TagNode[]).find((item) => {
      return deepEqual(item.query, urlParams);
    });

    if (node && state.tags.details) {
      // Make sure data is available and mapped correctly
      const tagData = node.data
        .filter((id) => state.tags.details && state.tags.details[id]) // Filter out undefined items
        .map((element) => state.tags.details[element]);

      return {
        tags: tagData,
        total: node.total,
        loading: state.tags.loading || false,
      };
    }
    return { tags: [], total: 0, loading: state.tags.loading || false };
  });

  // Get sidebar state from Redux store
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar?.collapsed ?? false
  );

  // Calculate left margin based on sidebar state
  const sidebarWidth = isCollapsed ? "89px" : "265px";

  // Define the header height (including padding)
  const headerHeight = "calc(1.5rem + 2.5rem + 1rem)"; // top padding + height + bottom padding

  // Filter tags locally based on search text
  const filteredTags = useMemo(() => {
    let filtered = tags;

    // Filter tags based on search text
    if (searchText.trim()) {
      filtered = tags.filter((tag: any) => {
        const searchLower = searchText.toLowerCase();
        const nameMatch =
          typeof tag.name === "string"
            ? tag.name.toLowerCase().includes(searchLower)
            : false;

        // Check if description exists and is a string before calling toLowerCase
        const descriptionMatch =
          typeof tag.description === "string"
            ? tag.description.toLowerCase().includes(searchLower)
            : false;

        // Add any other fields you want to search
        const slugMatch =
          typeof tag.slug === "string"
            ? tag.slug.toLowerCase().includes(searchLower)
            : false;

        return nameMatch || descriptionMatch || slugMatch;
      });
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name?.localeCompare(b.name || "") || 0;
      } else {
        return b.name?.localeCompare(a.name || "") || 0;
      }
    });
  }, [tags, searchText, sortOrder]);

  const handleSortToggle = useCallback(() => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  }, []);

  const updateURLParams = useCallback(
    (newParams: Record<string, any>) => {
      const searchParams = new URLSearchParams();
      const combinedParams = {
        ...urlParams,
        ...newParams,
      };

      Object.entries(combinedParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (
            (key === "page" && value === 1) ||
            (key === "limit" && value === 10)
          ) {
            return;
          }
          searchParams.set(key, String(value));
        }
      });

      navigate(
        {
          pathname: location.pathname,
          search: searchParams.toString(),
        },
        { replace: true }
      );
    },
    [urlParams, navigate, location.pathname]
  );

  useEffect(() => {
    // Initialize form with filters
    if (form.current) {
      try {
        const formFilters = new Filters(urlParams);
        const formElements = form.current.elements;
        for (const key in formFilters) {
          if (formElements[key] && formFilters[key] !== undefined) {
            (formElements[key] as HTMLInputElement).value = formFilters[key];
          }
        }
      } catch (error) {
        console.error("Error initializing form:", error);
      }
    }
  }, [urlParams]);

  useEffect(() => {
    fetchTags();
  }, [location.search]);

  const fetchTags = useCallback(() => {
    const paramsToUse = {
      ...urlParams,
      page: urlParams.page || 1,
      limit: urlParams.limit || 10,
    };

    dispatch(getTags(paramsToUse));
  }, [dispatch, urlParams]);

  const handleSortChange = (value: string) => {
    updateURLParams({ sort: value });
  };
  const handleSearchSubmit = () => {
    updateURLParams({ q: searchText, page: 1 });
  };

  // Pagination handlers
  const handlePageChange = useCallback(
    (page: number) => {
      updateURLParams({ page });
    },
    [updateURLParams]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      updateURLParams({ limit: size, page: 1 });
    },
    [updateURLParams]
  );

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(total / (filters.limit || 10)));

  return loading ? (
    <Loader />
  ) : (
    <div className="flex flex-col h-full w-full">
      <Helmet title={"Tags"} />

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
          <form
            ref={form}
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchSubmit();
            }}
            className="flex items-center gap-4 flex-1"
          >
            <div className="relative flex-1 max-w-xs">
              <Input
                name="q"
                placeholder="Search tags..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="h-10"
              />
            </div>
          </form>
          <div>
            <Link to="/tags/create">
              <Button size="lg" className="flex items-center gap-2 py-2">
                <PlusCircle className="h-4 w-4" />
                Create tag
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
        <TagList
          data={{
            tags: filteredTags,
            total: total,
            loading,
          }}
          filters={filters}
          setFilters={updateURLParams}
          fetchTags={fetchTags}
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
          currentPage={filters.page || 1}
          totalPages={totalPages}
          totalItems={total}
          pageSize={filters.limit || 10}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}

export default Tags;
