import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import MonacoEditor from "../../../components/MonacoEditor";
import getJsonValue from "../../../utils/getJsonValue";
import { SlugInput } from "../../../components/FormItems";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Type definitions
interface Organization {
  id: string;
  title: string;
}

interface WebsiteData {
  name?: string;
  site_title?: string;
  tag_line?: string;
  description?: string;
  slug?: string;
  site_address?: string;
  organisation_id?: string;
  space_id?: string;
  meta_fields?: string | Record<string, any>;
}

interface WebsiteEditFormProps {
  onCreate: (values: WebsiteData) => void;
  data?: WebsiteData;
}

// Form schema
const websiteFormSchema = z.object({
  organisation_id: z.string({ required_error: "Organisation is required" }),
  space_id: z.string({ required_error: "Space ID is required" }),
  name: z
    .string()
    .min(3, { message: "Name must be minimum 3 characters." })
    .max(50, { message: "Name must be maximum 50 characters." }),
  site_title: z.string().optional(),
  tag_line: z.string().optional(),
  description: z.string().optional(),
  slug: z.string().optional(),
  site_address: z.string().optional(),
  meta_fields: z.any().optional(),
});

type WebsiteFormValues = z.infer<typeof websiteFormSchema>;

const WebsiteEditForm: React.FC<WebsiteEditFormProps> = ({
  onCreate,
  data = {},
}) => {
  // Process meta_fields if it exists
  const processedData = { ...data };
  if (
    processedData.meta_fields &&
    typeof processedData.meta_fields !== "string"
  ) {
    processedData.meta_fields = JSON.stringify(processedData.meta_fields);
  }

  // Redux state
  const orgs = useSelector(
    (state: { spaces: { orgs: Organization[] } }) => state.spaces.orgs
  );
  const currentSpaceID = useSelector(
    (state: { spaces: { selected: string } }) => state.spaces.selected
  );

  // Local state
  const [valueChange, setValueChange] = useState<boolean>(false);

  // Form setup
  const form = useForm<WebsiteFormValues>({
    resolver: zodResolver(websiteFormSchema),
    defaultValues: {
      ...processedData,
      space_id: processedData.space_id || currentSpaceID,
    },
  });

  // Form submission handler
  const onSubmit = (values: WebsiteFormValues) => {
    const finalValues = { ...values };
    if (finalValues.meta_fields) {
      finalValues.meta_fields = getJsonValue(finalValues.meta_fields as string);
    }
    onCreate(finalValues);
  };

  // Reset form handler
  const handleCancel = () => {
    form.reset({
      ...processedData,
      space_id: processedData.space_id || currentSpaceID,
    });
    setValueChange(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Added Heading and Subheading with bottom border */}
      <div className="mb-4 px-4">
        <h1 className="text-xl font-semibold text-gray-900">Edit Website</h1>
        <div className="mt-2">
          <p className="text-gray-600 text-[13px]">
            Modify the website details by entering the essential information
            below
          </p>
        </div>
      </div>

      {/* Added a top border above the form */}
      <div className="border-t border-gray-200 mb-4"></div>

      <Form {...form}>
        <form
          className="w-full"
          onSubmit={form.handleSubmit(onSubmit)}
          onChange={() => setValueChange(true)}
        >
          <div className="w-full">
            <Accordion
              type="multiple"
              defaultValue={["title-description"]}
              className="w-full"
            >
              <AccordionItem
                value="title-description"
                className="rounded-md overflow-hidden mb-2"
              >
                <AccordionTrigger className="hover:no-underline px-4 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base font-medium">
                      Title and Description
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-6 bg-white space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="organisation_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">
                                Organisation
                              </FormLabel>
                              <Select
                                disabled
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select organisation" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {orgs.map((org) => (
                                    <SelectItem key={org.id} value={org.id}>
                                      {org.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="space_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">
                                Space ID
                              </FormLabel>
                              <FormControl>
                                <Input {...field} disabled />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Input name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="site_title"
                          render={({ field }) => (
                            <FormItem className="text-base">
                              <FormLabel className="text-base">Title</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="tag_line"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">
                                Tag line
                              </FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <SlugInput form={form} />

                        <FormField
                          control={form.control}
                          name="site_address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">
                                Site Address
                              </FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">
                                Description
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter Description..."
                                  {...field}
                                  className="min-h-24"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="meta-fields"
                className="rounded-md overflow-hidden mb-2"
              >
                <AccordionTrigger className="hover:no-underline px-4 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base font-medium">Meta Fields</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-6 bg-white">
                    <FormField
                      control={form.control}
                      name="meta_fields"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">
                            Metafields
                          </FormLabel>
                          <FormControl>
                            <MonacoEditor
                              language="json"
                              width="100%"
                              value={field.value as string}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="flex justify-start mb-8 mt-8 space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={!valueChange}
              className="px-6"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!valueChange} className="px-6">
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default WebsiteEditForm;
