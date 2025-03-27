import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Helmet } from "react-helmet";
import deepEqual from "deep-equal";
import debounce from "lodash/debounce";

// Lucide icons
import { Filter, PlusCircle } from "lucide-react";

// shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Custom components
import FactCheckList from "../../components/List";
import FormatNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import Template from "../../components/Template";
import Selector from "../../components/Selector";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";

// Utils and actions
import getUserPermission from "../../utils/getUserPermission";
import getUrlParams from "../../utils/getUrlParams";
import Filters from "../../utils/filters";
import { getPosts } from "../../actions/posts";
import { useForm } from "react-hook-form";

// TypeScript interfaces
interface Format {
  id: number;
  name: string;
  slug: string;
}

interface Formats {
  loading: boolean;
  factcheck: Format | null;
  article: Format | null;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_medium_id: number;
  status: string;
  published_date: string;
  medium?: Media;
  [key: string]: any;
}

interface Media {
  id: number;
  url: string;
  alt_text: string;
  [key: string]: any;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  [key: string]: any;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  [key: string]: any;
}

interface Author {
  id: number;
  display_name: string;
  slug: string;
  [key: string]: any;
}

interface FilterValues {
  format?: number[];
  page?: number;
  limit?: number;
  q?: string;
  sort?: string;
  tag?: number[];
  category?: number[];
  author?: number[];
  status?: string;
}

interface FactCheckProps {
  formats: Formats;
}

interface RootState {
  posts: {
    loading: boolean;
    details: Record<number, Post>;
    req: Array<{
      query: FilterValues;
      data: number[];
      total: number;
    }>;
  };
  media: {
    details: Record<number, Media>;
  };
  tags: {
    details: Record<number, Tag>;
  };
  categories: {
    details: Record<number, Category>;
  };
  authors: {
    details: Record<number, Author>;
  };
  spaces: any;
  sidebar: {
    collapsed: boolean;
  };
}

const FactCheck: React.FC<FactCheckProps> = ({ formats }) => {
  const dispatch = useDispatch();
  const { search, pathname } = useLocation();
  const navigate = useNavigate();
  const form = useForm();

  // Read the current search query from URL
  const query = new URLSearchParams(search);
  const initialSearchText = query.get("q") || "";
  const [searchText, setSearchText] = useState(initialSearchText);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const spaces = useSelector((state: RootState) => state.spaces);
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.collapsed
  );

  const actions = getUserPermission({
    resource: "fact-checks",
    action: "get",
    spaces,
  });

  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [status, setStatus] = useState(query.get("status") || "all");
  const [filters, setFilters] = useState({
    page: parseInt(query.get("page") || "1", 10),
    limit: parseInt(query.get("limit") || "10", 10),
    status: query.get("status") || "all",
    q: query.get("q") || "",
    sort: query.get("sort") || "",
    format:
      formats && !formats.loading && formats.factcheck
        ? [formats.factcheck.id]
        : [],
  });

  const keys = [
    "format",
    "page",
    "limit",
    "q",
    "sort",
    "tag",
    "category",
    "author",
    "status",
  ];
  const params = getUrlParams(query, keys);

  if (formats && !formats.loading && formats.factcheck) {
    params["format"] = [formats.factcheck.id];
  }

  // Reset form when URL search params change or formats load
  useEffect(() => {
    if (form) {
      form.reset(new Filters(params));
    }
  }, [search, formats.loading, form]);

  // Fetch posts when URL search params change or formats load
  useEffect(() => {
    fetchPosts();
  }, [search, formats.loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPosts = () => {
    dispatch(getPosts(params));
  };

  // Debounced search function to update URL
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      const newQuery = new URLSearchParams(query.toString());

      if (value.trim()) {
        newQuery.set("q", value);
      } else {
        newQuery.delete("q");
      }

      // Reset page when searching
      newQuery.set("page", "1");

      navigate({
        pathname,
        search: "?" + newQuery.toString(),
      });
    }, 500),
    [pathname, query]
  );

  // Handle search input change with debounce
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchText("");
    const newQuery = new URLSearchParams(query.toString());
    newQuery.delete("q");

    navigate({
      pathname,
      search: "?" + newQuery.toString(),
    });
  };

  const { posts, total, loading, tags, categories, authors } = useSelector(
    (state: RootState) => {
      const node = state.posts.req.find((item) => {
        return deepEqual(item.query, params);
      });

      if (node) {
        return {
          posts: node.data.map((element) => {
            const post = { ...state.posts.details[element] };
            post.medium = state.media.details[post.featured_medium_id];
            return post;
          }),
          total: node.total,
          loading: state.posts.loading,
          tags: state.tags.details,
          categories: state.categories.details,
          authors: state.authors.details,
        };
      }

      return {
        posts: [],
        total: 0,
        loading: state.posts.loading,
        tags: {},
        categories: {},
        authors: {},
      };
    }
  );

  const factCheckStatusItems = [
    { value: "all", label: "All" },
    { value: "publish", label: "Published" },
    { value: "future", label: "Future Publish" },
    { value: "ready", label: "Ready to Publish" },
    { value: "draft", label: "Drafts" },
  ];

  // Handle applying filters from the filter popover
  const onSave = (values: FilterValues) => {
    let searchFilter = new URLSearchParams();

    // Preserve existing search text if present
    if (searchText.trim()) {
      searchFilter.set("q", searchText);
    }

    // Add status filter
    if (status !== "all") {
      searchFilter.set("status", status);
    }

    // Add all other filter values
    Object.entries(values).forEach(([key, value]) => {
      if (value && key !== "q") {
        // Skip "q" as we handle it separately
        if (
          ["format", "tag", "author", "category"].includes(key) &&
          Array.isArray(value)
        ) {
          value.forEach((each) => {
            searchFilter.append(key, each.toString());
          });
        } else {
          if (status !== "all" || key !== "status") {
            searchFilter.set(key, value.toString());
          }
        }
      }
    });

    // Always set format to factcheck format
    if (formats && !formats.loading && formats.factcheck) {
      searchFilter.set("format", formats.factcheck.id.toString());
    }

    navigate({
      pathname,
      search: "?" + searchFilter.toString(),
    });

    // Close the filters popover after applying
    setIsFiltersOpen(false);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    const newQuery = new URLSearchParams(query.toString());
    newQuery.set("page", page.toString());

    navigate({
      pathname,
      search: "?" + newQuery.toString(),
    });
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    const newQuery = new URLSearchParams(query.toString());
    newQuery.set("limit", size.toString());
    newQuery.set("page", "1");

    navigate({
      pathname,
      search: "?" + newQuery.toString(),
    });
  };

  // Handle status tab change
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

  // Check if any filters are applied
  const hasActiveFilters = () => {
    return !!(
      (params.tag && params.tag.length > 0) ||
      (params.category && params.category.length > 0) ||
      (params.author && params.author.length > 0)
    );
  };

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  // Calculate sidebar width based on sidebar state
  const sidebarWidth = isCollapsed ? "89px" : "265px";

  // Define the header height (including padding)
  const headerHeight = "calc(1.5rem + 2.5rem + 1rem)"; // top padding + height + bottom padding

  if (formats.loading) {
    return <Loader />;
  }

  if (!formats.factcheck) {
    return (
      <FormatNotFound
        status="info"
        title="Fact-Check format not found"
        link="/formats/create"
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Helmet title={"Fact-checks"} />

      {/* Templates Dialog */}
      <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Templates</DialogTitle>
          </DialogHeader>
          {formats.factcheck && <Template format={formats.factcheck} />}
        </DialogContent>
      </Dialog>

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
                placeholder="Search fact-checks..."
                value={searchText}
                onChange={handleSearch}
                className="h-10"
              />
              {searchText && (
                <Button
                  variant="ghost"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={clearSearch}
                >
                  ✕
                </Button>
              )}
            </div>
            <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={hasActiveFilters() ? "default" : "outline"}
                  className="flex items-center bg-[#F0F5FF] border-[#F0F5FF] space-x-1"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-4">
                  <Form {...form}>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="tag"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <Selector
                              mode="multiple"
                              action="Tags"
                              placeholder="Filter Tags"
                              {...field}
                            />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categories</FormLabel>
                            <Selector
                              mode="multiple"
                              action="Categories"
                              placeholder="Filter Categories"
                              {...field}
                            />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="author"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Authors</FormLabel>
                            <Selector
                              mode="multiple"
                              action="Authors"
                              placeholder="Filter Authors"
                              display="display_name"
                              {...field}
                            />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        className="w-full"
                        onClick={() => form.handleSubmit(onSave)()}
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </Form>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              className="flex items-center space-x-1 bg-[#DCEFEB]"
              onClick={() => setTemplatesOpen(true)}
            >
              <span>Explore Templates</span>
            </Button>
          </div>
          <div>
            <Link to="/fact-checks/create">
              <Button size="lg" className="flex items-center gap-2 py-2">
                <PlusCircle className="h-4 w-4" />
                Create Fact-Check
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
        <Tabs defaultValue={status} onValueChange={handleStatusChange}>
          <TabsList className="grid grid-cols-5">
            {factCheckStatusItems.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Content for the selected tab */}
          <TabsContent value={status}>
            <FactCheckList
              actions={actions}
              format={formats.factcheck}
              data={{
                posts: posts,
                total: total,
                loading,
                tags,
                categories,
                authors,
              }}
              filters={params}
              fetchPosts={fetchPosts}
              query={status}
            />
          </TabsContent>
        </Tabs>
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
          currentPage={parseInt(params.page || "1", 10)}
          totalPages={totalPages}
          totalItems={total}
          pageSize={parseInt(params.limit || "10", 10)}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
};

export default FactCheck;
