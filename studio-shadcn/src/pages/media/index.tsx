/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Search } from "lucide-react";
import { useSelector } from "react-redux";
import MediumList from "./components/MediumList";
import { getMedia } from "../../actions/media";
import { Link, useLocation, useNavigate } from "react-router-dom";
import deepEqual from "deep-equal";
import getUrlParams from "../../utils/getUrlParams";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import Filters from "../../utils/filters";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAppDispatch } from "@/hooks/reduxHooks";

// Define types
interface MediaItem {
  id: string;
  [key: string]: any;
}

interface MediaState {
  details: Record<string, MediaItem>;
  loading: boolean;
  req: Array<{
    query: Record<string, any>;
    data: string[];
    total: number;
  }>;
}

interface RootState {
  media: MediaState;
}

interface PermissionProps {
  permission?: {
    actions: string[];
  };
}

interface FilterParams {
  q?: string;
  sort?: string;
  [key: string]: any;
}

// Form schema
const formSchema = z.object({
  q: z.string().optional(),
  sort: z.string().optional(),
});

function Media({ permission = { actions: [] } }: PermissionProps): JSX.Element {
  const { actions } = permission;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const params = getUrlParams(query) as FilterParams;

  // Use a ref to track initial mount
  const isInitialMount = useRef(true);
  const previousParams = useRef(params);

  const [filters, setFilters] = React.useState<FilterParams>({
    ...params,
  });
  const [searchFieldExpand, setSearchFieldExpand] =
    React.useState<boolean>(false);

  const pathName = location.pathname;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      q: params.q || "",
      sort: params.sort || "desc",
    },
  });

  const { media, total, loading } = useSelector((state: RootState) => {
    const node = state.media.req.find((item) => {
      return deepEqual(item.query, params);
    });

    if (node)
      return {
        media: node.data.map((element) => state.media.details[element]),
        total: node.total,
        loading: state.media.loading,
      };
    return { media: [], total: 0, loading: state.media.loading };
  });

  // FIXED: Only update URL if filters actually changed from params
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only update URL if filters don't match current params
    if (!deepEqual(filters, params)) {
      navigate({
        pathname: pathName,
        search: new URLSearchParams(
          filters as Record<string, string>
        ).toString(),
      });
    }
  }, [filters, navigate, pathName, params]);

  // FIXED: Only reset form when params change from previous value
  useEffect(() => {
    // Skip if this is just the initial params
    if (isInitialMount.current) {
      return;
    }

    // Only reset if params have actually changed
    if (!deepEqual(params, previousParams.current)) {
      previousParams.current = params;

      // Use setTimeout to break potential synchronous update cycle
      setTimeout(() => {
        form.reset(new Filters(params));
      }, 0);
    }
  }, [params, form]);

  // FIXED: Fetch data only once on initial load and when params change
  useEffect(() => {
    dispatch(getMedia(params));
  }, [dispatch, JSON.stringify(params)]); // Use JSON.stringify for deep comparison

  // Use useCallback to prevent unnecessary re-creation
  const fetchMedia = useCallback((): void => {
    dispatch(getMedia(filters));
  }, [dispatch, filters]);

  const onFormSubmit = (values: z.infer<typeof formSchema>): void => {
    let filterValue: FilterParams = {};
    Object.keys(values).forEach((key) => {
      const k = key as keyof z.infer<typeof formSchema>;
      if (values[k]) {
        filterValue[key] = values[k] as string;
      }
    });
    setFilters({
      ...filters,
      ...filterValue,
    });
  };

  const onValuesChange = (
    changedValues: Partial<z.infer<typeof formSchema>>
  ): void => {
    if (!("q" in changedValues)) {
      setFilters({ ...filters, ...changedValues });
    } else if (changedValues.q === "") {
      const { q, ...filtersWithoutQuery } = filters;
      setFilters({ ...filtersWithoutQuery });
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <div className="space-y-4">
      <Helmet title={"Media"} />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="w-full mb-4"
          onChange={(e) => {
            const target = e.target as HTMLInputElement;
            if (target.name && target.name !== "q") {
              onValuesChange({ [target.name]: target.value });
            }
          }}
        >
          <div className="flex justify-between gap-4 flex-wrap">
            <div>
              <div className="flex gap-4 items-center">
                <h3 className="text-2xl font-semibold m-0 inline">Media</h3>
                <div>
                  {searchFieldExpand ? (
                    <div className="flex">
                      <FormField
                        control={form.control}
                        name="q"
                        render={({ field }) => (
                          <FormItem>
                            <Input placeholder="Search media" {...field} />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="ml-2">
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onFocus={() => {
                              setSearchFieldExpand(true);
                              setTimeout(() => {
                                form.getValues().q === "" &&
                                  setSearchFieldExpand(false);
                              }, 10000);
                            }}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Search</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="flex flex-col items-end gap-4">
                <div className="flex justify-end">
                  <Link to="/media/upload">
                    <Button className="mb-4">Upload</Button>
                  </Link>
                </div>
                <div className="flex gap-4">
                  <div>
                    <FormField
                      control={form.control}
                      name="sort"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span>Sort By</span>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Sort By" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="desc">Latest</SelectItem>
                                <SelectItem value="asc">Old</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
      <MediumList
        actions={actions}
        data={{ media: media, total: total, loading: loading }}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
}

export default Media;
