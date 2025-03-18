import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
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
import { maker } from "../../../utils/sluger";
import getJsonValue from "../../../utils/getJsonValue";
import { SlugInput } from "../../../components/FormItems";
import MonacoEditor from "../../../components/MonacoEditor/index";
import { Building2 } from "lucide-react";
import { RootState } from "../../../store";
import { getSpaces } from "../../../actions/spaces";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

export interface Space {
  id: string;
  name: string;
}

interface SpaceCreateFormProps {
  onCreate: (values: SpaceFormValues) => void;
}

export interface SpaceFormValues {
  organisation_id: string;
  name: string;
  slug: string;
  site_title?: string;
  tag_line?: string;
  site_address?: string;
  description?: string;
  meta_fields?: Record<string, any>;
}

const SpaceCreateForm: React.FC<SpaceCreateFormProps> = ({ onCreate }) => {
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();

  const form = useForm<SpaceFormValues>({
    defaultValues: {
      organisation_id: "",
      name: "",
      slug: "",
      site_title: "",
      tag_line: "",
      site_address: "",
      description: "",
    },
  });

  useEffect(() => {
    dispatch(getSpaces());
  }, [dispatch]);

  const orgs = useSelector((state: RootState) => state.spaces?.orgs || []);
  const loading = useSelector((state: RootState) => state.spaces?.loading);

  const onReset = (): void => {
    form.reset();
  };

  const onTitleChange = (value: string): void => {
    form.setValue("slug", maker(value));
  };

  const handleSubmit = (values: SpaceFormValues): void => {
    if (values.meta_fields && typeof values.meta_fields === "string") {
      values.meta_fields = getJsonValue(values.meta_fields as string);
    }
    onCreate(values);
    onReset();
  };

  const adminOrgs = orgs.filter((o) => o.role === "admin");

  return (
    <div className="bg-white flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="mb-3 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Create Space</h2>
          <p className="text-gray-600 mt-2">
            Set up a category to help organize by utilizing the advanced options
            provided below.
          </p>
        </div>

        <div className="bg-white">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <Accordion
                type="multiple"
                defaultValue={["general"]}
                className="w-full"
              >
                {/* General Section */}
                <AccordionItem value="general">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="text-lg font-semibold">General</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6 pt-4">
                      {/* Name */}
                      <FormField
                        control={form.control}
                        name="name"
                        rules={{
                          required: "Name is required",
                          minLength: { value: 3, message: "Min 3 characters" },
                          maxLength: {
                            value: 30,
                            message: "Max 30 characters",
                          },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Space title"
                                maxLength={30}
                                onChange={(e) => {
                                  field.onChange(e);
                                  onTitleChange(e.target.value);
                                }}
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
                        rules={{ required: "Organisation is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization</FormLabel>
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
                                {loading ? (
                                  <SelectItem value="loading" disabled>
                                    Loading organizations...
                                  </SelectItem>
                                ) : adminOrgs.length === 0 ? (
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
                            <FormLabel>Description</FormLabel>
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
                <AccordionItem value="site-details">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="text-lg font-semibold">Site details</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6 pt-4">
                      <FormField
                        control={form.control}
                        name="site_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Title</FormLabel>
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
                            <FormLabel>Tagline</FormLabel>
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
                            <FormLabel>Website URL</FormLabel>
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
                <AccordionItem value="meta-fields">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="text-lg font-semibold">Meta fields</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="meta_fields"
                        render={({ field }) => (
                          <FormItem>
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

              {/* Action Buttons */}
              <div className="flex justify-start gap-3 pt-4 border-t border-gray-100">
                <Button type="submit">Create space</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SpaceCreateForm;
