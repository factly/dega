import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Building2 } from "lucide-react";
import MonacoEditor from "../../../components/MonacoEditor";
import getJsonValue from "../../../utils/getJsonValue";
import { SlugInput } from "../../../components/FormItems";
import { RootState } from "../../../types";
import { useIsMobile } from "@/hooks/use-mobile";

export interface Space {
  id: string;
  name: string;
  site_address: string;
  site_title: string;
  tag_line: string;
  description?: string;
  slug?: string;
  organisation_id: string;
  meta_fields?: string | Record<string, any>;
  org_role?: string;
}

export interface Organization {
  id: string;
  title: string;
  role: string;
  spaces: string[];
}

interface SpaceEditFormProps {
  onCreate: (values: Partial<Space>) => void;
  data?: Partial<Space>;
}

const SpaceEditForm: React.FC<SpaceEditFormProps> = ({
  onCreate,
  data = {},
}) => {
  const [valueChange, setValueChange] = useState<boolean>(false);
  const isMobile = useIsMobile();
  const orgs: Organization[] = useSelector(
    (state: RootState) => state.spaces.orgs
  );

  // Initialize data
  const initialData = { ...data };
  if (initialData && initialData.meta_fields) {
    if (typeof initialData.meta_fields !== "string") {
      initialData.meta_fields = JSON.stringify(
        initialData.meta_fields,
        null,
        2
      );
    }
  }

  // Define form schema
  const formSchema = z.object({
    organisation_id: z.string({ required_error: "Organisation is required" }),
    name: z
      .string()
      .min(3, { message: "Name must be minimum 3 characters." })
      .max(50, { message: "Name must be maximum 50 characters." }),
    slug: z.string().optional(),
    site_title: z.string().optional(),
    tag_line: z.string().optional(),
    site_address: z.string().optional(),
    description: z.string().optional(),
    meta_fields: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData as FormValues,
  });

  const onSubmit = (values: FormValues) => {
    const submitValues = { ...values };
    if (submitValues.meta_fields) {
      submitValues.meta_fields = getJsonValue(submitValues.meta_fields);
    }
    onCreate(submitValues);
    setValueChange(false);
  };

  const adminOrgs = orgs.filter((o) => o.role === "admin");

  return (
    <div className={isMobile ? "" : "bg-white flex justify-center"}>
      <div className={isMobile ? "w-full" : "w-full max-w-3xl"}>
        {/* Mobile header */}
        {isMobile && (
          <div className="mb-4">
            <h1 className="text-xl font-semibold">Edit Space</h1>
            <div className="mt-2">
              <p className="text-gray-600 text-[13px]">
                Update your space settings and information.
              </p>
            </div>
          </div>
        )}

        {/* Desktop header */}
        {!isMobile && (
          <div className="mb-3 pb-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Edit Space</h2>
              <p className="text-gray-600 mt-2">
                Update your space settings and information.
              </p>
            </div>
            <Button
              disabled={!valueChange}
              type="submit"
              form="edit-space-form"
              className="flex items-center gap-2"
            >
              Update
            </Button>
          </div>
        )}

        {isMobile && <div className="border-t border-gray-200 mb-4"></div>}

        <div className="bg-white">
          <Form {...form}>
            <form
              id="edit-space-form"
              onSubmit={form.handleSubmit(onSubmit)}
              onChange={() => setValueChange(true)}
              className="space-y-6"
            >
              <Accordion
                type="multiple"
                defaultValue={["general", "site-details", "meta-fields"]}
                className="w-full"
              >
                {/* General Section */}
                <AccordionItem
                  value="general"
                  className="rounded-md overflow-hidden mb-2"
                >
                  <AccordionTrigger className="hover:no-underline px-4 py-3 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white">
                    <span
                      className={
                        isMobile
                          ? "text-base font-medium"
                          : "text-lg font-semibold"
                      }
                    >
                      General
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6 pt-4 px-4 pb-4">
                      {/* Name */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={isMobile ? "text-base" : ""}>
                              Title
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Space title"
                                maxLength={50}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Organization */}
                      <FormField
                        control={form.control}
                        name="organisation_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={isMobile ? "text-base" : ""}>
                              Organization
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select organization" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {adminOrgs.length === 0 ? (
                                  <SelectItem value="none" disabled>
                                    No admin organizations found
                                  </SelectItem>
                                ) : (
                                  adminOrgs.map((org) => (
                                    <SelectItem key={org.id} value={org.id}>
                                      <div className="flex items-center">
                                        <Building2 className="mr-2 h-4 w-4" />
                                        {org.title}
                                      </div>
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Slug */}
                      <div>
                        <SlugInput form={form} />
                      </div>

                      {/* Description */}
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={isMobile ? "text-base" : ""}>
                              Description
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Brief description..."
                                className="resize-none"
                                rows={6}
                                maxLength={500}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Site Details Section */}
                <AccordionItem
                  value="site-details"
                  className="rounded-md overflow-hidden mb-2"
                >
                  <AccordionTrigger className="hover:no-underline px-4 py-3 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white">
                    <span
                      className={
                        isMobile
                          ? "text-base font-medium"
                          : "text-lg font-semibold"
                      }
                    >
                      Site details
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6 pt-4 px-4 pb-4">
                      <FormField
                        control={form.control}
                        name="site_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={isMobile ? "text-base" : ""}>
                              Site Title
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter site title"
                                maxLength={50}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tag_line"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={isMobile ? "text-base" : ""}>
                              Tagline
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter tagline"
                                maxLength={100}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="site_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={isMobile ? "text-base" : ""}>
                              Website URL
                            </FormLabel>
                            <FormControl>
                              <div className="flex">
                                <div className="bg-gray-100 flex items-center px-3 rounded-l-md border border-r-0 border-input">
                                  https://
                                </div>
                                <Input
                                  {...field}
                                  className="rounded-l-none"
                                  placeholder="example.com"
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Meta Fields Section */}
                <AccordionItem
                  value="meta-fields"
                  className="rounded-md overflow-hidden mb-2"
                >
                  <AccordionTrigger className="hover:no-underline px-4 py-3 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white">
                    <span
                      className={
                        isMobile
                          ? "text-base font-medium"
                          : "text-lg font-semibold"
                      }
                    >
                      Meta fields
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4 px-4 pb-4">
                      <FormField
                        control={form.control}
                        name="meta_fields"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={isMobile ? "text-base" : ""}>
                              Metadata
                            </FormLabel>
                            <FormControl>
                              <div className="border border-input rounded-md overflow-hidden">
                                <MonacoEditor
                                  width="100%"
                                  height="200px"
                                  language="json"
                                  value={field.value as string}
                                  onChange={field.onChange}
                                  options={{
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Add custom metadata in JSON format
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Mobile Action Buttons */}
              {isMobile && (
                <div className="flex justify-between mb-8 mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="w-[48%]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!valueChange}
                    className="w-[48%]"
                  >
                    Update
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SpaceEditForm;
