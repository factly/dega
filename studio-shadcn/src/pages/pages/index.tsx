/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import deepEqual from 'deep-equal';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '@/hooks/reduxHooks';

// shadcn/ui components
import {
  Button
} from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// lucide icons
import { X ,Filter, PlusCircle } from 'lucide-react';

// Local components
import PageList from './components/PageList';
import Selector from '../../components/Selector';
import FormatNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import Loader from '../../components/Loader';

// Utils and actions
import getUrlParams from '../../utils/getUrlParams';
import Filters from '../../utils/filters';
import { getPages } from '../../actions/pages';

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
  
  const [expand, setExpand] = useState<boolean>(false);
  const [searchFieldExpand, setSearchFieldExpand] = useState<boolean>(false);
  const [status, setStatus] = useState<string>(query.get('status') || 'all');
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>(query.get('q') || '');

  const spaces = useSelector((state: RootState) => state.spaces);

  const keys = ['page', 'limit', 'q', 'sort', 'tag', 'category', 'author', 'status'];
  const params = getUrlParams(query, keys) as FilterParams;

  // Create form
  const form = new Filters(params);
  
  // Add React Hook Form for shadcn/ui form components
  const formMethods = useForm({
    defaultValues: {
      q: params.q || '',
      sort: params.sort || 'desc',
      tag: params.tag || [],
      category: params.category || [],
      author: params.author || [],
    }
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
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetching pages on search change
  useEffect(() => {
    fetchPages();
  }, [search]);

  const fetchPages = () => {
    dispatch(getPages(params));
  };

  // Get current pages data
  const { pages, total, loading, tags, categories } = useSelector((state: RootState) => {
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
    return { pages: [], total: 0, loading: state.pages.loading, tags: {}, categories: {} };
  });

  const getFields = () => {
    if (!expand) return null;
    
    return (
      <>
        <div className={isMobileScreen ? "w-full mb-4" : "w-1/3 mb-4"}>
          <FormField
            control={formMethods.control}
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
        </div>
        <div className={isMobileScreen ? "w-full mb-4" : "w-1/3 mb-4"}>
          <FormField
            control={formMethods.control}
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
        </div>
        <div className={isMobileScreen ? "w-full mb-4" : "w-1/3 mb-4"}>
          <FormField
            control={formMethods.control}
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
        </div>
      </>
    );
  };

  const pageStatusItems = [
    { value: 'all', label: 'All' },
    { value: 'publish', label: 'Published' },
    { value: 'future', label: 'Future Publish' },
    { value: 'ready', label: 'Ready to Publish' },
    { value: 'draft', label: 'Drafts' },
  ];

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSearchSubmit = () => {
    const newQuery = new URLSearchParams(query.toString());
    
    if (searchText.trim()) {
      newQuery.set('q', searchText);
    } else {
      newQuery.delete('q');
    }
    
    // Reset page when searching
    newQuery.set('page', '1');
    
    navigate({
      pathname,
      search: '?' + newQuery.toString(),
    });
  };

  const clearSearch = () => {
    setSearchText('');
    const newQuery = new URLSearchParams(query.toString());
    newQuery.delete('q');
    
    navigate({
      pathname,
      search: '?' + newQuery.toString(),
    });
  };

  const onSave = (values: FilterParams) => {
    let searchFilter = new URLSearchParams();
    
    // Preserve search text if present
    if (searchText.trim()) {
      searchFilter.set('q', searchText);
    }
    
    // Add status filter
    status !== 'all' && searchFilter.set('status', status);
    
    Object.keys(values).forEach((key) => {
      if (values[key]) {
        if (key === 'format' || key === 'tag' || key === 'author' || key === 'category') {
          (values[key] as string[]).forEach((each) => {
            searchFilter.append(key, each);
          });
        } else {
          if (values.status !== 'all') searchFilter.set(key, values[key] as string);
        }
      }
    });
    
    if (formats && !formats.loading && formats.article) {
      searchFilter.set('format', formats.article.id);
    }
    
    navigate({
      pathname: pathname,
      search: '?' + searchFilter.toString(),
    });
  };

  const onPagination = (page: number, limit: number) => {
    query.set('limit', limit.toString());
    query.set('page', page.toString());
    navigate({
      pathname: pathname,
      search: '?' + query.toString(),
    });
  };

  const handleStatusChange = (value: string) => {
    const newQuery = new URLSearchParams(query.toString());
    
    if (value === 'all') {
      newQuery.delete('status');
    } else {
      newQuery.set('status', value);
    }
    
    // Reset page when changing status
    newQuery.set('page', '1');
    
    setStatus(value);
    navigate({
      pathname,
      search: '?' + newQuery.toString(),
    });
  };

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
    <div className="flex flex-col space-y-4">
      <Helmet title={'Pages'} />
      
      <div>
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Input
                placeholder="Search pages..."
                value={searchText}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                className="pr-8"
              />
              {searchText && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button onClick={handleSearchSubmit} size="sm">
              Search
            </Button>
          </div>
          
          <div className="flex items-center">
            <Link to="/pages/create">
              <Button 
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Create Page
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <Form {...formMethods}>
            <form onSubmit={formMethods.handleSubmit((data) => onSave({ ...data, ...form }))}>
              <div className="flex items-center gap-4">
                <FormField
                  control={formMethods.control}
                  name="sort"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormLabel className="text-sm whitespace-nowrap">Sort By</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.sort = value;
                          onSave(form);
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">Latest</SelectItem>
                          <SelectItem value="asc">Oldest</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      <span>Filters</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4">
                    <div className="space-y-4">
                      <h4 className="font-medium">Filter Pages</h4>
                      
                      <FormField
                        control={formMethods.control}
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
                        control={formMethods.control}
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
                        control={formMethods.control}
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
                        onClick={() => formMethods.handleSubmit((data) => onSave({ ...data, ...form }))()}
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </form>
          </Form>
        </div>
      </div>
      
      <Tabs 
        defaultValue={status}
        onValueChange={handleStatusChange}
        className="w-full"
      >
        <TabsList className="w-full max-w-2xl grid grid-cols-5 mb-4">
          {pageStatusItems.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {pageStatusItems.map((item) => (
          <TabsContent key={item.value} value={item.value} className="mt-0">
            <PageList
              format={formats.article}
              data={{
                pages,
                total,
                loading,
                tags,
                categories,
              }}
              filters={params}
              onPagination={onPagination}
              fetchPages={fetchPages}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default Pages;