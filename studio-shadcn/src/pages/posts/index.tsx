import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Helmet } from "react-helmet";
import deepEqual from "deep-equal";

// Lucide icons
import { Filter, PlusCircle } from "lucide-react";

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

// Custom components
import PostList from "../../components/List";
import FormatNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import Template from "../../components/Template";
import Selector from "../../components/Selector";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";

// Utils and actions
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

const Posts: React.FC<PostsProps> = ({ formats }) => {
  const dispatch = useDispatch();
  const { search, pathname } = useLocation();
  const navigate = useNavigate();
  const form = useForm();

  // Read the current search query from URL
  const query = new URLSearchParams(search);
  const initialSearchText = query.get("q") || "";
  const [searchText, setSearchText] = useState(initialSearchText);

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

  const postStatusItems = [
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

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Handle search submission (Enter key or search button)
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

  // Handle Enter key press in search input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleServerSearch();
    }
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

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  // Calculate sidebar width based on sidebar state
  const sidebarWidth = isCollapsed ? "89px" : "265px";

  // Define the header height (including padding)
  const headerHeight = "calc(1.5rem + 2.5rem + 1rem)"; // top padding + height + bottom padding

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
    <div className="flex flex-col h-full">
      <Helmet title={"Posts"} />

      {/* Templates Dialog */}
      <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Templates</DialogTitle>
          </DialogHeader>
          {formats.article && <Template format={formats.article} />}
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
                placeholder="Search posts..."
                value={searchText}
                onChange={handleSearch}
                onKeyPress={handleKeyPress}
                className="h-10"
              />
            </div>
            <Button
              variant="outline"
              className="flex items-center bg-[#F0F5FF] border-[#F0F5FF] space-x-1"
              onClick={() => form.handleSubmit(onSave)()}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-1 bg-[#DCEFEB]"
              onClick={() => setTemplatesOpen(true)}
            >
              <span>Explore Templates</span>
            </Button>
          </div>
          <div>
            <Link to="/posts/create">
              <Button size="lg" className="flex items-center gap-2 py-2">
                <PlusCircle className="h-4 w-4" />
                Create Post
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
            {postStatusItems.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={status}>
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

export default Posts;
