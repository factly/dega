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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { maker } from "../../../utils/sluger";
import getJsonValue from "../../../utils/getJsonValue";
import MediaSelector from "../../../components/MediaSelector";
import { MetaForm, SlugInput } from "../../../components/FormItems";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const navigate = useNavigate();
  const [valueChange, setValueChange] = useState(false);
  const isMobile = useIsMobile();

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

  // Watch for changes to enable the submit button
  React.useEffect(() => {
    const subscription = form.watch(() => setValueChange(true));
    return () => subscription.unsubscribe();
  }, [form]);

  // Handle title change to generate slug
  const onTitleChange = (value: string) => {
    form.setValue("slug", maker(value), { shouldDirty: true });
    setValueChange(true);
  };

  const onReset = () => {
    form.reset(initialData as FormatFormValues);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    navigate(-1); // Navigate to the previous page
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
    onReset();
  };

  return (
    <div className={isMobile ? "" : "px-60 max-w-6xl mx-auto"}>
      {/* Mobile header */}
      {isMobile && (
        <div className="mb-4">
          <h1 className="text-xl font-semibold">
            {data && data.id ? "Edit Format" : "Create Format"}
          </h1>
          <div className="mt-2">
            <p className="text-gray-600 text-[13px]">
              Set up a format by entering the essential details provided below
            </p>
          </div>
        </div>
      )}

      {/* Desktop header */}
      {!isMobile && (
        <div className="mb-6 px-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {data && data.id ? "Edit Format" : "Create Format"}
          </h1>
          <div className="mt-2">
            <p className="text-gray-600 text-[13px]">
              Set up a format by entering the essential details provided below
            </p>
          </div>
        </div>
      )}

      {/* Top border */}
      <div className="border-t border-gray-200 mb-4"></div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mx-auto">
          <div className="w-full">
            <Accordion
              type="multiple"
              defaultValue={["general"]}
              className="w-full"
            >
              <AccordionItem
                value="general"
                className="rounded-md overflow-hidden mb-2"
              >
                <AccordionTrigger className="hover:no-underline px-4 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base font-medium">General</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="py-3 bg-white">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="mb-6">
                            <FormLabel className="text-base">Title</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Format name"
                                onChange={(e) => {
                                  field.onChange(e);
                                  onTitleChange(e.target.value);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="mb-6">
                        <SlugInput form={form} />
                      </div>

                      <FormField
                        control={form.control}
                        name="is_featured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between">
                            <FormLabel className="text-base">
                              Featured
                            </FormLabel>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(value) => {
                                field.onChange(value);
                                setValueChange(true);
                              }}
                            />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="mb-6">
                            <FormLabel className="text-base mb-2">
                              Description
                            </FormLabel>
                            <Textarea
                              {...field}
                              placeholder="Enter description"
                              onChange={(e) => {
                                field.onChange(e);
                                setValueChange(true);
                              }}
                              className="min-h-24"
                            />
                          </FormItem>
                        )}
                      />

                      {/* Featured Image - Moved below Description */}
                      <FormField
                        control={form.control}
                        name="medium_id"
                        render={({ field }) => (
                          <FormItem className="mt-6">
                            <FormLabel className="text-base mb-2">
                              Featured Image
                            </FormLabel>
                            <div className="flex justify-center items-start mt-4">
                              <MediaSelector
                                value={field.value}
                                onChange={(value) => {
                                  field.onChange(value);
                                  setValueChange(true);
                                }}
                                containerStyles={{
                                  justifyContent: "center",
                                  width: isMobile ? "84%" : "100%",
                                  height: isMobile ? "160px" : "220px",
                                }}
                              />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="w-full mb-2">
            <MetaForm form={form} />
          </div>

          <div
            className={`flex ${
              isMobile ? "justify-between" : "justify-start"
            } mb-8 mt-8`}
          >
            <div
              className={isMobile ? "w-full flex justify-between" : "space-x-4"}
            >
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className={isMobile ? "w-[48%]" : "px-6"}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!valueChange}
                className={isMobile ? "w-[48%]" : "px-6"}
              >
                {data && data.id
                  ? "Update"
                  : isMobile
                  ? "Create"
                  : "Create format"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FormatForm;
