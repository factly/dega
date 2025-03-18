import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ExpandIcon, ShrinkIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { maker } from "../../../utils/sluger";
import getJsonValue from "../../../utils/getJsonValue";
import MediaSelector from "../../../components/MediaSelector";
import { MetaForm, SlugInput } from "../../../components/FormItems";

// Define the format data interface
interface FormatData {
  id?: string;
  name?: string;
  slug?: string;
  is_featured?: boolean;
  description?: string;
  medium_id?: number | string;
  meta_fields?: string | Record<string, unknown>;
}

// Define the form schema using zod
const formatFormSchema = z.object({
  name: z
    .string()
    .min(3, {
      message: "Name must be minimum 3 characters.",
    })
    .max(50, {
      message: "Name must be maximum 50 characters.",
    }),
  slug: z.string(),
  is_featured: z.boolean().default(false),
  description: z.string().optional(),
  medium_id: z.number().optional(),
  meta_fields: z.union([z.string(), z.record(z.unknown())]).optional(),
});

type FormatFormValues = z.infer<typeof formatFormSchema>;

interface FormatFormProps {
  onCreate: (values: FormatData) => void;
  data?: FormatData;
}

const FormatForm: React.FC<FormatFormProps> = ({ onCreate, data = {} }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [valueChange, setValueChange] = useState(false);

  // Process meta_fields if it exists
  const initialData = { ...data };
  if (initialData.meta_fields && typeof initialData.meta_fields !== "string") {
    initialData.meta_fields = JSON.stringify(initialData.meta_fields);
  }

  // Initialize the form
  const form = useForm<FormatFormValues>({
    resolver: zodResolver(formatFormSchema),
    defaultValues: initialData as FormatFormValues,
  });

  // Handle title change to generate slug
  const onTitleChange = (value: string) => {
    form.setValue("slug", maker(value), { shouldDirty: true });
  };

  // Handle form submission
  const onSubmit = (values: FormatFormValues) => {
    const submissionValues = { ...values };

    if (submissionValues.meta_fields) {
      submissionValues.meta_fields = getJsonValue(
        submissionValues.meta_fields as string
      );
    }

    onCreate(submissionValues);
    form.reset();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onChange={() => setValueChange(true)}
        className="w-full max-w-6xl mx-auto"
      >
        <div className="flex justify-end mb-4">
          <Button type="submit" disabled={!valueChange}>
            {data && data.id ? "Update" : "Submit"}
          </Button>
        </div>

        <div className="mb-6">
          <Collapsible
            open={!isCollapsed}
            onOpenChange={setIsCollapsed}
            className="w-full bg-slate-100 rounded-md"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">General</h3>
              <CollapsibleTrigger asChild>
                <Button variant="outline">
                  {isCollapsed ? (
                    <ExpandIcon className="h-4 w-4 mr-2" />
                  ) : (
                    <ShrinkIcon className="h-4 w-4 mr-2" />
                  )}
                  {isCollapsed ? "Expand" : "Collapse"}
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="p-4 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-7">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Format Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              onTitleChange(e.target.value);
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <SlugInput form={form} />

                  <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 my-4">
                        <FormLabel>Featured</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={5} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-5">
                  <FormField
                    control={form.control}
                    name="medium_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Featured Image</FormLabel>
                        <FormControl>
                          <MediaSelector
                            value={field.value}
                            onChange={field.onChange}
                            maxWidth="250px"
                            containerStyles={{
                              maxWidth: "250px",
                              justifyContent: "start",
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="bg-slate-100 rounded-md">
          <MetaForm />
        </div>
      </form>
    </Form>
  );
};

export default FormatForm;
