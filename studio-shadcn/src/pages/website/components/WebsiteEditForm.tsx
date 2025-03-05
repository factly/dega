import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { ChevronDown, ChevronUp } from "lucide-react";

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
  const [titleSectionOpen, setTitleSectionOpen] = useState<boolean>(true);
  const [metaFieldsOpen, setMetaFieldsOpen] = useState<boolean>(true);

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
    <div className="max-w-3xl mx-auto px-4 space-y-4">
      {" "}
      <Form {...form}>
        <form
          className="edit-form"
          onSubmit={form.handleSubmit(onSubmit)}
          onChange={() => setValueChange(true)}
        >
          <Collapsible
            open={titleSectionOpen}
            onOpenChange={setTitleSectionOpen}
            className="w-full rounded-md mb-4"
          >
            <div
              className={`flex items-center justify-between px-4 py-2 border-b hover:bg-[#F0F5FF] transition-colors ${
                titleSectionOpen ? "bg-[#F0F5FF]" : "bg-white"
              }`}
            >
              <h3 className="text-lg font-medium">Title and Description</h3>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {titleSectionOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent>
              <div className="p-4 bg-white space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="organisation_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organisation</FormLabel>
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
                          <FormLabel>Space ID</FormLabel>
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
                          <FormLabel>Name</FormLabel>
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
                        <FormItem>
                          <FormLabel>Title</FormLabel>
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
                          <FormLabel>Tag line</FormLabel>
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
                          <FormLabel>Site Address</FormLabel>
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
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter Description..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={metaFieldsOpen}
            onOpenChange={setMetaFieldsOpen}
            className="w-full rounded-md"
          >
            <div
              className={`flex items-center justify-between px-4 py-2 border-b hover:bg-[#F0F5FF] transition-colors ${
                metaFieldsOpen ? "bg-[#F0F5FF]" : "bg-white"
              }`}
            >
              <h3 className="text-lg font-medium">Meta Fields</h3>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {metaFieldsOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent>
              <div className="p-4 bg-white">
                <FormField
                  control={form.control}
                  name="meta_fields"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metafields</FormLabel>
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
            </CollapsibleContent>
          </Collapsible>
        </form>
      </Form>
      <div className="flex justify-start gap-2 mb-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={!valueChange}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={!valueChange}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default WebsiteEditForm;
