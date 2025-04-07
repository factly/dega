import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import MonacoEditor from "../../components/MonacoEditor";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { updateSpace } from "../../actions/spaces";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "../../hooks/reduxHooks";

// Define types for our state and props
interface Space {
  id: string;
  name: string;
  slug: string;
  organisation_id: string;
  header_code?: string;
  footer_code?: string;
  [key: string]: any;
}
interface RootState {
  spaces: {
    selected: string;
    details: {
      [key: string]: Space;
    };
    loading: boolean;
  };
}

function CodeInjection(): React.ReactElement {
  const id = useSelector((state: RootState) => state.spaces.selected);
  const dispatch = useAppDispatch();
  const [valueChange, setValueChange] = useState<boolean>(false);

  const { space, loading } = useSelector((state: RootState) => {
    return {
      space: state.spaces.details[id],
      loading: state.spaces.loading,
    };
  });

  const form = useForm<Space>({
    defaultValues: space,
  });

  // Reset form when space changes
  useEffect(() => {
    if (space) {
      form.reset(space);
      setValueChange(false); // Reset valueChange when form is reset
    }
  }, [space, form]);

  // This will run whenever any form field changes
  const onFormChange = () => {
    setValueChange(true);
  };

  const onSubmit = (values: Space) => {
    dispatch(updateSpace({ ...space, ...values }));
    setValueChange(false);
  };

  if (loading) return <Skeleton className="w-full h-64" />;

  if (!space) {
    return <RecordNotFound />;
  }

  return (
    <div className="container mx-auto">
      <Helmet title={"Code Injection"} />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          onChange={onFormChange} // Add onChange handler to the form
        >
          <FormField
            control={form.control}
            name="header_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Header Code</FormLabel>
                <MonacoEditor
                  language="html"
                  width="100%"
                  value={field.value || ""}
                  onChange={(value) => {
                    field.onChange(value);
                    setValueChange(true); // Set valueChange to true when editor content changes
                  }}
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="footer_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Footer Code</FormLabel>
                <MonacoEditor
                  language="html"
                  width="100%"
                  value={field.value || ""}
                  onChange={(value) => {
                    field.onChange(value);
                    setValueChange(true);
                  }}
                />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <div className="flex justify-start mt-6">
        <Button
          type="submit"
          disabled={!valueChange}
          className="flex items-center gap-2"
        >
          Update
        </Button>
      </div>
    </div>
  );
}

export default CodeInjection;
