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
import { useIsMobile } from "@/hooks/use-mobile";
import { Space, RootState } from "./types";

function AnalyticsForm() {
  const dispatch = useAppDispatch();
  const [valueChange, setValueChange] = useState(false);
  const isMobile = useIsMobile();
  // Get space ID from Redux state
  const id = useSelector((state: RootState) => state.spaces.selected);
  // Get space and loading state from Redux
  const { space, loading } = useSelector((state: RootState) => {
    return {
      space: state.spaces.details[id],
      loading: state.spaces.loading,
    };
  });
  const form = useForm<Space>({
    // Do not set default values here, we'll set them with reset when space data loads
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      if (form.formState.isDirty) {
        setValueChange(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Use useEffect to update form values when space data is loaded
  useEffect(() => {
    if (space) {
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

  // Handle form reset/cancel
  const handleCancel = () => {
    if (space) {
      // Reset to the original values from the space data
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
      form.reset(formValues);
      setValueChange(false);
    }
  };

  // Show loading state
  if (loading) return <Skeleton className="w-full h-48" />;

  // Show not found state
  if (!space) {
    return <RecordNotFound />;
  }

  return (
    <>
      <Helmet title="Analytics Settings" />
      <div className="px-4 sm:px-6 md:px-8 lg:px-16 xl:px-60 max-w-6xl mx-auto">
        <div className="mb-4 px-4">
          <h1 className="text-xl font-semibold">Analytics Settings</h1>
          <div className="mt-2">
            <p className="text-gray-600 text-[13px]">
              Configure your analytics tracking to monitor visitor activity on
              your website
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 mb-4"></div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full mx-auto"
            onChange={() => setValueChange(true)}
          >
            <div className="w-full mb-6 bg-white rounded-md">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="analytics.plausible.server_url"
                  render={({ field }) => (
                    <FormItem className="mb-4 sm:mb-6">
                      <FormLabel className="text-base">Server URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="text-sm sm:text-base h-9 sm:h-10"
                          placeholder="https://plausible.io"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="analytics.plausible.domain"
                  render={({ field }) => (
                    <FormItem className="mb-4 sm:mb-6">
                      <FormLabel className="text-base">Domain</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="text-sm sm:text-base h-9 sm:h-10"
                          placeholder="yourdomain.com"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="analytics.plausible.embed_code"
                  render={({ field }) => (
                    <FormItem className="mb-4 sm:mb-6">
                      <FormLabel className="text-base">Embed Code</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="min-h-24 text-sm sm:text-base"
                          placeholder="<script>...</script>"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-start mb-8 mt-8 gap-3 sm:gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="w-full sm:w-auto sm:px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!valueChange}
                className="w-full sm:w-auto sm:px-6"
              >
                Update
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}

export default AnalyticsForm;
