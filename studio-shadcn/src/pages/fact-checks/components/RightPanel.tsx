import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ChevronLeft, X, FileSearch, MoreHorizontal } from "lucide-react";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Custom Components
import { SlugInput } from "@/components/FormItems";
import MediaSelector from "@/components/MediaSelector";
import MonacoEditor from "@/components/MonacoEditor";
import Selector from "@/components/Selector";
import { formatDate } from "@/utils/date";

interface RightPanelProps {
  activePanel: string;
  closePanel: () => void;
  form: UseFormReturn<any>;
  data: any;
  onSave: (values: any) => void;
  setActivePanel: (panel: string) => void;
  isVisible: boolean; // New prop to control animation
}

const RightPanel: React.FC<RightPanelProps> = ({
  activePanel,
  closePanel,
  form,
  data,
  onSave,
  setActivePanel,
  isVisible,
}) => {
  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background border-l shadow-lg overflow-y-auto
      transform transition-transform duration-500 ease-in-out ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-4 h-full flex flex-col">
        {activePanel === "main" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Fact-Check Settings</h3>
              <Button variant="outline" size="icon" onClick={closePanel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto flex-grow">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSave)}
                  className="space-y-4"
                >
                  <Accordion
                    type="single"
                    collapsible
                    defaultValue="details"
                    className="w-full space-y-3"
                  >
                    {/* Details Section */}
                    <AccordionItem value="details" className="border-b">
                      <AccordionTrigger className="text-base font-medium hover:no-underline px-4 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white rounded-md">
                        General
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="space-y-4">
                          {/* Creation and update info (moved status info to top of title) */}
                          <div className="space-y-1">
                            {data?.created_at && (
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">
                                  Created Date:{" "}
                                </span>
                                {formatDate(data.created_at)}
                              </p>
                            )}
                            {data?.updated_at && (
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">
                                  Last updated:{" "}
                                </span>
                                {formatDate(data.updated_at)}
                              </p>
                            )}
                          </div>

                          {/* Published Date */}
                          <FormField
                            control={form.control}
                            name="published_date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Publication Date</FormLabel>
                                <DatePicker
                                  date={
                                    field.value
                                      ? new Date(field.value)
                                      : undefined
                                  }
                                  onSelect={field.onChange}
                                />
                              </FormItem>
                            )}
                          />

                          {/* Authors */}
                          <FormField
                            control={form.control}
                            name="authors"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Authors</FormLabel>
                                <Selector
                                  mode="multiple"
                                  display="display_name"
                                  action="Authors"
                                  value={field.value || []}
                                  onChange={field.onChange}
                                />
                              </FormItem>
                            )}
                          />

                          {/* Featured Image */}
                          <FormField
                            control={form.control}
                            name="featured_medium_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Featured Image</FormLabel>
                                <MediaSelector
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </FormItem>
                            )}
                          />

                          {/* Claims */}
                          <FormField
                            control={form.control}
                            name="claims"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Claims</FormLabel>
                                <Selector
                                  mode="multiple"
                                  display="claim"
                                  action="Claims"
                                  value={field.value || []}
                                  onChange={field.onChange}
                                />
                              </FormItem>
                            )}
                          />

                          {/* Add Claim Button */}
                          <Button
                            type="button"
                            onClick={() => {
                              closePanel();
                            }}
                          >
                            Add Claim
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Other Details Section */}
                    <AccordionItem value="other-details" className="border-b">
                      <AccordionTrigger className="text-base font-medium hover:no-underline px-4 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white rounded-md">
                        Other Details
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="space-y-4">
                          {/* Excerpt */}
                          <FormField
                            control={form.control}
                            name="excerpt"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Excerpt</FormLabel>
                                <Textarea
                                  {...field}
                                  placeholder="Excerpt"
                                  className="resize-none"
                                  rows={4}
                                />
                              </FormItem>
                            )}
                          />

                          {/* Subtitle */}
                          <FormField
                            control={form.control}
                            name="subtitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subtitle</FormLabel>
                                <Input {...field} placeholder="Subtitle" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Categories Section */}
                    <AccordionItem value="categories" className="border-b">
                      <AccordionTrigger className="text-base font-medium hover:no-underline px-4 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white rounded-md">
                        Categories
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <FormField
                          control={form.control}
                          name="categories"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Categories</FormLabel>
                              <Selector
                                mode="multiple"
                                action="Categories"
                                createEntity="Category"
                                value={field.value || []}
                                onChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>

                    {/* Tags Section */}
                    <AccordionItem value="tags" className="border-b">
                      <AccordionTrigger className="text-base font-medium hover:no-underline px-4 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white rounded-md">
                        Tags
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <FormField
                          control={form.control}
                          name="tags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tags</FormLabel>
                              <Selector
                                mode="multiple"
                                action="Tags"
                                createEntity="Tag"
                                value={field.value || []}
                                onChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Separator />
                  {/* Others Section */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center w-full text-left">
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                      <span className="font-medium">Others</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pt-2">
                      {/* SEO Button */}
                      <Button
                        type="button"
                        variant="outline"
                        className="flex items-center w-full text-left"
                        onClick={() => setActivePanel("meta")}
                      >
                        <span className="font-medium">SEO Settings</span>
                      </Button>
                    </CollapsibleContent>
                    <CollapsibleContent className="space-y-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setActivePanel("meta")}
                      >
                        Add Meta Data
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setActivePanel("code")}
                      >
                        Code Injection
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          // This would need to be handled by the parent component
                          closePanel();
                        }}
                      >
                        View Schemas
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setActivePanel("meta-fields")}
                      >
                        Add Meta Fields
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                </form>
              </Form>
            </div>
          </>
        )}

        {activePanel === "meta" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Post Meta Data</h3>
              <Button variant="outline" size="icon" onClick={closePanel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto flex-grow">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSave)}
                  className="space-y-4"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex items-center gap-1"
                    onClick={() => setActivePanel("main")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>

                  <SlugInput form={form} />

                  <FormField
                    control={form.control}
                    name="meta.title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Meta Title</FormLabel>
                        <Input {...field} />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meta.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          Meta Description
                        </FormLabel>
                        <Textarea {...field} className="resize-none" rows={4} />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meta.canonical_URL"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          Canonical URL
                        </FormLabel>
                        <Input {...field} />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </>
        )}

        {activePanel === "code" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Code Injection</h3>
              <Button variant="ghost" size="icon" onClick={closePanel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto flex-grow">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSave)}
                  className="space-y-4"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex justify-start gap-1"
                    onClick={() => setActivePanel("main")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>

                  <FormField
                    control={form.control}
                    name="header_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Header Code</FormLabel>
                        <MonacoEditor
                          language="html"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="footer_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Footer Code</FormLabel>
                        <MonacoEditor
                          language="html"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </>
        )}

        {activePanel === "meta-fields" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Meta Fields</h3>
              <Button variant="ghost" size="icon" onClick={closePanel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto flex-grow">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSave)}
                  className="space-y-4"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex items-center gap-1"
                    onClick={() => setActivePanel("main")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>

                  <FormField
                    control={form.control}
                    name="meta_fields"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Fields</FormLabel>
                        <FormDescription>
                          Add JSON if you have to pass any extra data
                        </FormDescription>
                        <MonacoEditor
                          language="json"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RightPanel;
