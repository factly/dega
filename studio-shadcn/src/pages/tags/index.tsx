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

  // Update URL with new parameters (without affecting search)
  const updateURLParams = useCallback(
    (newParams: Record<string, any>) => {
      const searchParams = new URLSearchParams();

      // Combine existing params with new ones, but exclude 'q' if we're using local filtering
      const combinedParams = {
        ...urlParams,
        ...newParams,
      };

      // Only add non-empty/non-default values to keep URL clean
      Object.entries(combinedParams).forEach(([key, value]) => {
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

  // Fetch tags when URL params change (but not when just the search text changes)
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

  // Apply search to URL only when user explicitly submits
  const handleSearchSubmit = () => {
    updateURLParams({ q: searchText, page: 1 });
  };

  return loading ? (
    <Loader />
  ) : (
    <div className="flex flex-col h-full w-full">
      <Helmet title={"Tags"} />

      <div className="w-full">
        <form
          ref={form}
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchSubmit();
          }}
        >
          <div className="flex flex-row md:flex-row justify-between gap-4">
            <div className="relative w-83">
              <Input
                name="q"
                placeholder="Search tags..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
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
                    <Link to="/tags/create">
                      <Button
                        variant="default"
                        className="flex items-center gap-2"
                      >
                        <PlusCircle className="h-4 w-4" />
                        Create tag
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Make the TagList fill the remaining height */}
      <div className="flex-grow flex flex-col mt-2 min-h-0">
        <TagList
          data={{
            tags: filteredTags,
            total: filteredTags.length,
            loading,
          }}
          filters={filters}
          setFilters={updateURLParams}
          fetchTags={fetchTags}
          sortOrder={sortOrder}
          onSortToggle={handleSortToggle}
        />
      </div>
    </div>
  );
}

export default Tags;
