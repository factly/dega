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

  const spaces = useSelector((state: RootState) => state.spaces);
  const actions = getUserPermission({
    resource: "fact-checks",
    action: "get",
    spaces,
  });

  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [status, setStatus] = useState(query.get("status") || "all");

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

  const { posts, total, loading, tags, categories } = useSelector(
    (state: RootState) => {
      const node = state.posts.req.find((item) => {
        return deepEqual(item.query, params);
      });

      if (node) {
        return {
          posts: node.data.map((element) => {
            const post = state.posts.details[element];
            post.medium = state.media.details[post.featured_medium_id];
            return post;
          }),
          total: node.total,
          loading: state.posts.loading,
          tags: state.tags.details,
          categories: state.categories.details,
        };
      }

      return {
        posts: [],
        total: 0,
        loading: state.posts.loading,
        tags: {},
        categories: {},
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
  };

  // Handle pagination
  const onPagination = (page: number, limit: number) => {
    const newQuery = new URLSearchParams(query.toString());
    newQuery.set("limit", limit.toString());
    newQuery.set("page", page.toString());

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
    <div className="space-y-4">
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

      <div>
        <div className="flex items-center justify-between pb-3 w-full">
          {/* Search */}
          <div className="flex-1 flex justify-start">
            <div className="relative w-63">
              <Input
                placeholder="Search"
                className="py-2"
                value={searchText}
                onChange={handleSearch}
                onKeyPress={handleKeyPress}
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
            <Button
              className="ml-2"
              variant="outline"
              onClick={handleServerSearch}
            >
              Search
            </Button>
          </div>

          {/* Templates and Create buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="flex items-center space-x-1 bg-[#DCEFEB]"
              onClick={() => setTemplatesOpen(true)}
            >
              <span>Explore Templates</span>
            </Button>

            <Link to="/fact-checks/create">
              <Button className="flex items-center space-x-1">
                <PlusCircle className="h-4 w-4" />
                <span>Create Fact-Check</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Tabs defaultValue={status} onValueChange={handleStatusChange}>
            <div className="flex items-center justify-between">
              <TabsList className="grid grid-cols-5">
                {factCheckStatusItems.map((item) => (
                  <TabsTrigger key={item.value} value={item.value}>
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Filters Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
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
            </div>

            {factCheckStatusItems.map((item) => (
              <TabsContent key={item.value} value={item.value}>
                <FactCheckList
                  actions={actions}
                  format={formats.factcheck}
                  data={{
                    posts: posts,
                    total: total,
                    loading,
                    tags,
                    categories,
                  }}
                  filters={params}
                  onPagination={onPagination}
                  fetchPosts={fetchPosts}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FactCheck;
