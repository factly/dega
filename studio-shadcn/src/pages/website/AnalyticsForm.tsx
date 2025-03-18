import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { updateSpace } from "../../actions/spaces";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";

// Define types
interface AnalyticsPlausible {
  server_url?: string;
  domain?: string;
  embed_code?: string;
}

interface Analytics {
  plausible: AnalyticsPlausible;
}

interface Space {
  id: string;
  name: string;
  slug: string;
  organisation_id: string;
  analytics?: Analytics;
  [key: string]: any;
}

interface RootState {
  spaces: {
    selected: string;
    details: Record<string, Space>;
    loading: boolean;
  };
}

function AnalyticsForm() {
  const dispatch = useAppDispatch();
  const [valueChange, setValueChange] = useState(false);

  // Get space ID from Redux state
  const id = useSelector((state: RootState) => state.spaces.selected);

  // Get space and loading state from Redux
  const { space, loading } = useSelector((state: RootState) => {
    return {
      space: state.spaces.details[id],
      loading: state.spaces.loading,
    };
  });

  // Initialize form with react-hook-form
  const form = useForm<Space>({
    // Do not set default values here, we'll set them with reset when space data loads
  });

  // Watch for form value changes
  useEffect(() => {
    const subscription = form.watch(() => {
      // Only set valueChange to true if form has been initialized with data
      if (form.formState.isDirty) {
        setValueChange(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Use useEffect to update form values when space data is loaded
  useEffect(() => {
    if (space) {
      // Ensure we have the correct structure even if analytics is not present in the space data
      const formValues = {
        ...space,
        analytics: {
          plausible: {
            server_url: space.analytics?.plausible?.server_url || "",
            domain: space.analytics?.plausible?.domain || "",
            embed_code: space.analytics?.plausible?.embed_code || "",
          },
        },
      };

      // Reset the form with the space data
      form.reset(formValues);

      // Reset the value change tracker since we just loaded data
      setValueChange(false);
    }
  }, [space, form]);

  // Handle form submission
  const onSubmit = (values: Space) => {
    dispatch(updateSpace({ ...space, ...values }));
    setValueChange(false);
  };

  // Show loading state
  if (loading) return <Skeleton className="w-full h-48" />;

  // Show not found state
  if (!space) {
    return <RecordNotFound />;
  }

  return (
    <div className="space-y-6">
      <Helmet title="Analytics Form" />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          onChange={() => setValueChange(true)}
        >
          <div className="max-w-md space-y-4">
            <FormField
              control={form.control}
              name="analytics.plausible.server_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="analytics.plausible.domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="analytics.plausible.embed_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Embed Code</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-24" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={!valueChange}
            className="flex items-center gap-2"
          >
            Update
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default AnalyticsForm;
