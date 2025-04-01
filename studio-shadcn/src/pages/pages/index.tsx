import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import deepEqual from "deep-equal";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "@/hooks/reduxHooks";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

// lucide icons
import { X, Filter, PlusCircle } from "lucide-react";

// Local components
import PageList from "./components/PageList";
import Selector from "../../components/Selector";
import FormatNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import Loader from "../../components/Loader";
import Template from "../../components/Template";
import Pagination from "../../components/Pagination";

// Utils and actions
import getUrlParams from "../../utils/getUrlParams";
import Filters from "../../utils/filters";
import { getPages } from "../../actions/pages";

// Types
interface Format {
  id: string;
  slug: string;
  [key: string]: any;
}

interface FormatState {
  loading: boolean;
  article?: Format;
  [key: string]: any;
}

interface Space {
  [key: string]: any;
}

interface Page {
  id: number;
  title: string;
  slug: string;
  status: string;
  featured_medium_id?: number;
  medium?: any;
  [key: string]: any;
}

interface Author {
  id: number;
  display_name: string;
  [key: string]: any;
}

interface Category {
  id: number;
  name: string;
  [key: string]: any;
}

interface Tag {
  id: number;
  name: string;
  [key: string]: any;
}

interface PagesState {
  req: Array<{
    query: {
      [key: string]: any;
    };
    data: number[];
    total: number;
  }>;
  details: {
    [key: number]: Page;
  };
  loading: boolean;
}

interface MediaState {
  details: {
    [key: number]: any;
  };
}

interface TagsState {
  details: {
    [key: number]: Tag;
  };
}

interface CategoriesState {
  details: {
    [key: number]: Category;
  };
}

interface RootState {
  spaces: Space[];
  pages: PagesState;
  media: MediaState;
  tags: TagsState;
  categories: CategoriesState;
  sidebar: {
    collapsed: boolean;
  };
}

interface FilterParams {
  page?: number;
  limit?: number;
  q?: string;
  sort?: string;
  status?: string;
  tag?: string[];
  category?: string[];
  author?: string[];
  format?: string;
  [key: string]: any;
}

interface PagesProps {
  formats: FormatState;
}

function Pages({ formats }: PagesProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const { search, pathname } = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(search);

  const [templatesOpen, setTemplatesOpen] = useState<boolean>(false);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>(query.get("q") || "");
  const [status, setStatus] = useState<string>(query.get("status") || "all");
  const [filters, setFilters] = useState<FilterParams>({
    page: Number(query.get("page")) || 1,
    limit: Number(query.get("limit")) || 10,
    q: query.get("q") || "",
    sort: query.get("sort") || "desc",
    status: query.get("status") || "all",
    tag: query.getAll("tag") || [],
    category: query.getAll("category") || [],
    author: query.getAll("author") || [],
    format: query.get("format") || "",
  });

  const spaces = useSelector((state: RootState) => state.spaces);
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.collapsed
  );

  // Create form
  const form = useForm({
    defaultValues: {
      q: filters.q || "",
      sort: filters.sort || "desc",
      tag: filters.tag || [],
      category: filters.category || [],
      author: filters.author || [],
    },
  });

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobileScreen(true);
      } else {
        setIsMobileScreen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset form when URL search params change or formats load
  useEffect(() => {
    if (form) {
      form.reset(new Filters(filters));
    }
  }, [search, formats.loading, form, filters]);

  // Fetching pages on search change
  useEffect(() => {
    fetchPages();
  }, [search]);

  const fetchPages = () => {
    const params = getUrlParams(query, [
      "page",
      "limit",
      "q",
      "sort",
      "tag",
      "category",
      "author",
      "status",
    ]) as FilterParams;

    dispatch(getPages(params));
  };

  // Get current pages data
  const { pages, total, loading, tags, categories } = useSelector(
    (state: RootState) => {
      const params = getUrlParams(query, [
        "page",
        "limit",
        "q",
        "sort",
        "tag",
        "category",
        "author",
        "status",
      ]) as FilterParams;

      const node = state.pages.req.find((item) => {
        return deepEqual(item.query, params);
      });

      if (node)
        return {
          pages: node.data.map((element) => {
            const page = state.pages.details[element];
            page.medium = state.media.details[page.featured_medium_id || 0];
            return page;
          }),
          total: node.total,
          loading: state.pages.loading,
          tags: state.tags.details,
          categories: state.categories.details,
        };
      return {
        pages: [],
        total: 0,
        loading: state.pages.loading,
        tags: {},
        categories: {},
      };
    }
  );

  const pageStatusItems = [
    { value: "all", label: "All" },
    { value: "publish", label: "Published" },
    { value: "future", label: "Future Publish" },
    { value: "ready", label: "Ready to Publish" },
    { value: "draft", label: "Drafts" },
  ];

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSearchSubmit = () => {
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

  const clearSearch = () => {
    setSearchText("");
    const newQuery = new URLSearchParams(query.toString());
    newQuery.delete("q");

    navigate({
      pathname,
      search: "?" + newQuery.toString(),
    });
  };

  const onSave = (values: FilterParams) => {
    let searchFilter = new URLSearchParams();

    // Preserve search text if present
    if (searchText.trim()) {
      searchFilter.set("q", searchText);
    }

    // Add status filter
    status !== "all" && searchFilter.set("status", status);

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
      searchFilter.set("format", formats.article.id);
    }

    navigate({
      pathname: pathname,
      search: "?" + searchFilter.toString(),
    });
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);

    const newQuery = new URLSearchParams(query.toString());
    newQuery.set("page", page.toString());

    navigate({
      pathname,
      search: "?" + newQuery.toString(),
    });
  };

  const handlePageSizeChange = (size: number) => {
    const newFilters = { ...filters, page: 1, limit: size };
    setFilters(newFilters);

    const newQuery = new URLSearchParams(query.toString());
    newQuery.set("limit", size.toString());
    newQuery.set("page", "1");

    navigate({
      pathname,
      search: "?" + newQuery.toString(),
    });
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

  // Calculate total pages
  const totalPages = Math.max(
    1,
    Math.ceil(total / Number(filters.limit || 10))
  );

  // Calculate sidebar width based on sidebar state
  const sidebarWidth = isCollapsed ? "89px" : "265px";

  // Define the header height (including padding)
  const headerHeight = "calc(1.5rem + 2.5rem + 1rem)"; // top padding + height + bottom padding

  if (formats.loading) return <Loader />;

  if (!formats.article) {
    return (
      <FormatNotFound
        status="info"
        title="Article format not found"
        link="/advanced/formats/create"
      />
    );
  }

  return (
    <div className="flex flex-col h-full gap-6">
      <Helmet title={"Pages"} />

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
      <div>
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Input
                placeholder="Search pages..."
                value={searchText}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                className="h-10"
              />
              {searchText && (
                <Button
                  variant="ghost"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

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
                  <h4 className="font-medium">Filter Pages</h4>
                  <Form {...form}>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="tag"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl>
                              <Selector
                                mode="multiple"
                                action="Tags"
                                placeholder="Filter Tags"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categories</FormLabel>
                            <FormControl>
                              <Selector
                                mode="multiple"
                                action="Categories"
                                placeholder="Filter Categories"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="author"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Authors</FormLabel>
                            <FormControl>
                              <Selector
                                mode="multiple"
                                action="Authors"
                                placeholder="Filter Authors"
                                display="display_name"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        className="w-full"
                        onClick={() =>
                          form.handleSubmit((data) =>
                            onSave({ ...data, ...form })
                          )()
                        }
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
            <Link to="/pages/create">
              <Button size="lg" className="flex items-center gap-2 py-2">
                <PlusCircle className="h-4 w-4" />
                <span>Create Page</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        <Tabs defaultValue={status} onValueChange={handleStatusChange}>
          <TabsList className="grid grid-cols-5 ">
            {pageStatusItems.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={status} className="mt-0">
            <PageList
              format={formats.article}
              data={{
                pages,
                total,
                loading,
                tags,
                categories,
              }}
              filters={filters}
              onPagination={onPagination}
              fetchPages={fetchPages}
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
          currentPage={Number(filters.page) || 1}
          totalPages={totalPages}
          totalItems={total}
          pageSize={Number(filters.limit) || 10}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );

  // Legacy pagination function (kept for compatibility with PageList)
  function onPagination(page: number, limit: number) {
    handlePageChange(page);
    if (limit !== Number(filters.limit)) {
      handlePageSizeChange(limit);
    }
  }
}

export default Pages;
