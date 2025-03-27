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
    <div className="px-60 max-w-6xl mx-auto">
      {/* Header and Subheader */}
      <div className="mb-4 px-4">
        <h1 className="text-xl font-semibold text-gray-900">Create Format</h1>
        <div className="mt-2">
          <p className="text-gray-600 text-[13px]">
            Set up a format by entering the essential details provided below
          </p>
        </div>
      </div>

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
                  <div className="grid grid-cols-1 md:grid-cols-12 p-6 bg-white">
                    <div className="md:col-span-5 space-y-6">
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
                    </div>

                    <div className="md:col-span-7">
                      <FormField
                        control={form.control}
                        name="medium_id"
                        render={({ field }) => (
                          <FormItem className="h-full">
                            <FormLabel className="text-base mb-2">
                              Featured Image
                            </FormLabel>
                            <div className="flex justify-center items-start h-full mt-4">
                              <MediaSelector
                                value={field.value}
                                onChange={(value) => {
                                  field.onChange(value);
                                  setValueChange(true);
                                }}
                                containerStyles={{ justifyContent: "center" }}
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

          <div className="w-full mb-8">
            <MetaForm
              style={{ marginBottom: 24, background: "#f0f2f5", border: 0 }}
            />
          </div>

          <div className="flex justify-start mb-8 mt-8">
            <div className="space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="px-6"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!valueChange} className="px-6">
                {data && data.id ? "Update" : "Create format"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FormatForm;
