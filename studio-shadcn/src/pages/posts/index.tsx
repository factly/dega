import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Helmet } from "react-helmet";
import deepEqual from "deep-equal";

// Lucide icons
import { Filter, PlusCircle, Search, X } from "lucide-react";

// shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Custom components
import PostList from "../../components/List";
import FormatNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import Template from "../../components/Template";
import Selector from "../../components/Selector";
import Loader from "../../components/Loader";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
// Import PaginationFooter instead of using Pagination directly
import PaginationFooter from "@/components/PaginationFooter";

// Utils and actions
import getUrlParams from "../../utils/getUrlParams";
import Filters from "../../utils/filters";
import { getPosts } from "../../actions/posts";
import { useForm } from "react-hook-form";

// Custom hooks
import { useIsMobile } from "@/hooks/use-mobile";

// TypeScript interfaces
interface Format {
  id: number;
  name: string;
  slug: string;
}

interface Formats {
  loading: boolean;
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

interface PostsProps {
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

// Search Input Component
const SearchInput = ({
  searchText,
  setSearchText,
  handleSearchSubmit,
  clearSearch,
  autoFocus = false,
}) => {
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  return (
    <div className="relative flex-1">
      <Input
        placeholder="Search posts..."
        value={searchText}
        onChange={handleSearch}
        onKeyPress={handleKeyPress}
        className="h-9 w-64"
        autoFocus={autoFocus}
      />
      {searchText && (
        <button
          className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={clearSearch}
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <button
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        onClick={handleSearchSubmit}
      ></button>
    </div>
  );
};

// Search Button Component
const SearchButton = ({ onClick }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="h-9 w-9 p-0 flex items-center justify-center"
    >
      <Search className="h-4 w-4" />
    </Button>
  );
};

// FiltersPopover Component
const FiltersPopover = ({ form, onSave }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center bg-[#F0F5FF] border-[#F0F5FF] space-x-1 mb-5"
      onClick={() => form.handleSubmit(onSave)()}
    >
      <Filter className="h-4 w-4" />
      <span>Filters</span>
    </Button>
  );
};

// Status Tabs Component - Keeping it defined locally but with consistent style
const StatusTabs = ({
  status,
  handleStatusChange,
  children,
  isMobile,
  form,
  onSave,
}) => {
  const pageStatusItems = [
    { value: "all", label: "All" },
    { value: "publish", label: "Published" },
    { value: "future", label: "Future Publish" },
    { value: "ready", label: "Ready to Publish" },
    { value: "draft", label: "Drafts" },
  ];

  return (
    <Tabs
      defaultValue={status}
      onValueChange={handleStatusChange}
      value={status}
    >
      {!isMobile ? (
        <div className="flex mb-5">
          <TabsList className="grid grid-cols-5 flex-1 max-w-[60%] mr-120">
            {pageStatusItems.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <FiltersPopover form={form} onSave={onSave} />
        </div>
      ) : (
        <div className="space-y-4 flex justify-between items-center">
          <Select
            defaultValue={status}
            value={status}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={status} />
            </SelectTrigger>
            <SelectContent>
              {pageStatusItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isMobile && <FiltersPopover form={form} onSave={onSave} />}
        </div>
      )}

      <TabsContent value={status} className="mt-0">
        {children}
      </TabsContent>
    </Tabs>
  );
};

const Posts: React.FC<PostsProps> = ({ formats }) => {
  const dispatch = useDispatch();
  const { search, pathname } = useLocation();
  const navigate = useNavigate();
  const form = useForm();
  const isMobile = useIsMobile();

  // Read the current search query from URL
  const query = new URLSearchParams(search);
  const initialSearchText = query.get("q") || "";
  const [searchText, setSearchText] = useState(initialSearchText);
  const [isSearchExpanded, setIsSearchExpanded] = useState(!!initialSearchText);

  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.collapsed
  );

  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [status, setStatus] = useState(query.get("status") || "all");
  const [filters, setFilters] = useState({
    page: parseInt(query.get("page") || "1", 10),
    limit: parseInt(query.get("limit") || "10", 10),
    status: query.get("status") || "all",
    q: query.get("q") || "",
    sort: query.get("sort") || "",
    format:
      formats && !formats.loading && formats.article
        ? [formats.article.id]
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

  if (formats && !formats.loading && formats.article) {
    params["format"] = [formats.article.id];
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

  // If we have search text, make sure search is expanded on mobile
  useEffect(() => {
    if (searchText && isMobile && !isSearchExpanded) {
      setIsSearchExpanded(true);
    }
  }, [searchText, isMobile]);

  const fetchPosts = () => {
    dispatch(getPosts(params) as any);
  };

  const { posts, total, loading, tags, categories, authors } = useSelector(
    (state: RootState) => {
      const node = state.posts.req.find((item) => {
        return deepEqual(item.query, params);
      });

      if (node) {
        return {
          posts: node.data.map((element) => {
            // Create a copy of the post to avoid state mutation
            const post = { ...state.posts.details[element] };

            // Make sure status is preserved
            if (!post.status) {
              console.warn(`Post ${post.id} has no status`);
            }

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

    // Always set format to article format
    if (formats && !formats.loading && formats.article) {
      searchFilter.set("format", formats.article.id.toString());
    }

    navigate({
      pathname,
      search: "?" + searchFilter.toString(),
    });
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

  // Handle search submission
  const handleServerSearch = () => {
    const newQuery = new URLSearchParams(query.toString());

    if (searchText.trim()) {
      newQuery.set("q", searchText);
    } else {
      newQuery.delete("q");
    }

    // Reset page when searching
    newQuery.set("page", "1");

    navigate({
      pathname,
      search: "?" + newQuery.toString(),
    });
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

    // If on mobile, collapse the search input
    if (isMobile) {
      setIsSearchExpanded(false);
    }
  };

  // Toggle search on mobile
  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
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

  // Calculate pagination details
  const onPagination = (page: number, pageSize: number) => {
    handlePageChange(page);
  };

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  if (formats.loading) {
    return <Loader />;
  }

  if (!formats.article) {
    return (
      <FormatNotFound
        status="info"
        title="Article format not found"
        link="/formats/create"
      />
    );
  }

  return (
    <div className="flex flex-col h-full gap-6">
      <Helmet title="Posts" />

      {/* Templates Dialog */}
      <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Templates</DialogTitle>
          </DialogHeader>
          {formats.article && <Template format={formats.article} />}
        </DialogContent>
      </Dialog>

      {/* Mobile Header */}
      {isMobile ? (
        <div className="space-y-4 flex justify-between items-center">
          {/* Breadcrumb */}
          <MobileBreadcrumb currentPage="Posts" parentLabel="Core" />

          <div className="flex gap-2 items-center">
            {/* Search Button */}
            <div>
              <SearchButton onClick={toggleSearch} />
            </div>

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

              {/* Create Post Button */}
              <Link to="/posts/create">
                <Button size="sm" className="flex items-center gap-1">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Header */
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1">
            {/* Search Input - Always visible on desktop */}
            <SearchInput
              searchText={searchText}
              setSearchText={setSearchText}
              handleSearchSubmit={handleServerSearch}
              clearSearch={clearSearch}
            />

            {/* Templates Button */}
            <Button
              variant="outline"
              className="flex items-center space-x-1 bg-[#DCEFEB]"
              onClick={() => setTemplatesOpen(true)}
            >
              <span>Explore Templates</span>
            </Button>

            {/* Create Post Button */}
            <Link to="/posts/create">
              <Button size="lg" className="flex items-center gap-2 py-2">
                <PlusCircle className="h-4 w-4" />
                <span>Create Post</span>
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Search input row - appears when expanded on mobile */}
      {isMobile && isSearchExpanded && (
        <div className="w-full">
          <SearchInput
            searchText={searchText}
            setSearchText={setSearchText}
            handleSearchSubmit={handleServerSearch}
            clearSearch={clearSearch}
            autoFocus={true}
          />
        </div>
      )}

      {/* Status Tabs and Content */}
      <StatusTabs
        status={status}
        handleStatusChange={handleStatusChange}
        isMobile={isMobile}
        form={form}
        onSave={onSave}
      >
        <PostList
          format={formats.article}
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
          onPagination={onPagination}
          form={form}
          onSave={onSave}
        />
      </StatusTabs>

      {/* Replace the custom pagination implementation with PaginationFooter */}
      <PaginationFooter
        currentPage={parseInt(params.page || "1", 10)}
        totalPages={totalPages}
        selectedItems={0}
        totalItems={total}
        pageSize={parseInt(params.limit || "10", 10)}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default Posts;
