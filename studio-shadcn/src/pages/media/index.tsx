/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PlusCircle } from "lucide-react";
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
  sort?: string;
  page?: number;
  limit?: number;
  [key: string]: any;
}

// Form schema
const formSchema = z.object({
  sort: z.string().optional(),
});

function Media({ permission = { actions: [] } }: PermissionProps): JSX.Element {
  const { actions } = permission;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  // Set default pagination params if not present
  const defaultParams = {
    page: 1,
    limit: 10,
    sort: "desc",
  };

  // Get URL params and set defaults
  const rawParams = getUrlParams(query) as FilterParams;
  const params = { ...defaultParams, ...rawParams };

  // Use a ref to track initial mount and previous params
  const isInitialMount = useRef(true);
  const previousParams = useRef(params);

  const [filters, setFilters] = React.useState<FilterParams>({
    ...params,
  });

  const pathName = location.pathname;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sort: params.sort || "desc",
    },
  });

  // Get media data from Redux state
  const { media, total, loading } = useSelector((state: RootState) => {
    // Try to find cached data for current query params
    const node = state.media.req.find((item) => {
      return deepEqual(item.query, params);
    });

    if (node) {
      // Map IDs to actual media objects from details
      return {
        media: node.data
          .map((id) => state.media.details[id])
          // Filter out undefined or null values
          .filter(Boolean),
        total: node.total,
        loading: state.media.loading,
      };
    }

    // Return empty data if no cache node found
    return {
      media: [],
      total: 0,
      loading: state.media.loading,
    };
  });

  // Update URL when filters change
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

  // Reset form when params change
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

  // Fetch data on initial load and when params change
  useEffect(() => {
    // Use a stable params representation for the dependency
    const paramsString = JSON.stringify(params);

    // Explicitly log what we're fetching for debugging
    console.log("Fetching media with params:", params);

    dispatch(getMedia(params));
  }, [dispatch, JSON.stringify(params)]);

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
    setFilters({ ...filters, ...changedValues });
  };

  return loading ? (
    <Loader />
  ) : (
    <div className="space-y-4 p-4">
      <Helmet title={"Media"} />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="w-full mb-4"
          onChange={(e) => {
            const target = e.target as HTMLInputElement;
            if (target.name) {
              onValuesChange({ [target.name]: target.value });
            }
          }}
        >
          <div className="flex justify-between gap-4 flex-wrap">
            <div>
              <div className="flex gap-4 items-center">
                <h3 className="text-2xl font-semibold m-0 inline">Media</h3>
              </div>
            </div>
            <div>
              <div className="flex flex-col items-end gap-4">
                <div className="flex justify-end">
                  <Link to="/media/upload">
                    <Button className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      New Media
                    </Button>{" "}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
      <MediumList
        actions={actions}
        data={{ media: media || [], total: total || 0, loading: loading }}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
}

export default Media;
