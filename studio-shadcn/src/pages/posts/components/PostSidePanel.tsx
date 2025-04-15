import { Dispatch, SetStateAction, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  X,
  FileEdit,
  Tags,
  FolderClosed,
  Code,
  FileSearch,
  Settings,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Custom components and utilities
import Selector from "../../../components/Selector";
import MediaSelector from "../../../components/MediaSelector";
import { formatDate } from "../../../utils/date";
import { addErrorNotification } from "../../../actions/notifications";
import { maker } from "../../../utils/sluger";
import { PostData } from "./PostForm";

// Import languages data
import languages from "../../../utils/languages.json";

interface PostSidePanelProps {
  form: UseFormReturn<PostData>;
  data: PostData;
  status: string;
  setStatus: Dispatch<SetStateAction<string>>;
  valueChange: boolean;
  publishedDate: Date | undefined;
  setPublishedDate: Dispatch<SetStateAction<Date | undefined>>;
  onSave: (values: PostData, statusOverride?: string) => void;
  onClose: () => void;
  isVisible: boolean;
}

function PostSidePanel({
  form,
  data,
  status,
  publishedDate,
  setPublishedDate,
  onClose,
  isVisible,
}: PostSidePanelProps) {
  const dispatch = useDispatch();

  // Additional state for subpanels
  const [activeSubPanel, setActiveSubPanel] = useState<string | null>(null);
  const [schemaPanelOpen, setSchemaPanelOpen] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    form.getValues("language") || "English"
  );

  // Language options
  const languageOptions = languages.map((language: string) => ({
    value: language,
    label: language,
  }));

  // Handler for date selection to ensure it updates the parent component
  const handleDateSelect = (date: Date | undefined) => {
    setPublishedDate(date);
  };

  // Handle title change to update slug
  const onTitleChange = (value: string) => {
    if (status !== "publish") {
      form.setValue("slug", maker(value));
    }
  };

  // Copy schema to clipboard
  const copySchema = (schemas: any[]) => {
    if (!schemas || schemas.length === 0) return;

    const copyText = schemas
      .map(
        (schema) =>
          `<script type="application/ld+json">${JSON.stringify(
            schema
          )}</script>`
      )
      .join("\n");

    navigator.clipboard
      .writeText(copyText)
      .then(() => {
        dispatch(addErrorNotification("Schema copied to clipboard!"));
      })
      .catch(() => {
        dispatch(addErrorNotification("Failed to copy schema"));
      });
  };

  // Back button for subpanels
  const renderBackButton = () => (
    <Button
      variant="ghost"
      className="p-0 mb-4"
      onClick={() => setActiveSubPanel(null)}
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );

  const renderPanel = () => {
    if (activeSubPanel === "seo") {
      return (
        <div className="space-y-4">
          {renderBackButton()}
          <h3 className="text-lg font-semibold">SEO Settings</h3>

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="post-slug" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meta.title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Meta Title" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meta.description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Meta Description"
                    className="resize-none h-20"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meta.canonical_URL"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Canonical URL</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://example.com/canonical-page"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      );
    }

    if (activeSubPanel === "code") {
      return (
        <div className="space-y-4">
          {renderBackButton()}
          <h3 className="text-lg font-semibold">Code Injection</h3>

          <FormField
            control={form.control}
            name="header_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Header Code</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Add code to be injected in the header"
                    className="font-mono text-sm h-40 resize-none"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="footer_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Footer Code</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Add code to be injected in the footer"
                    className="font-mono text-sm h-40 resize-none"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      );
    }

    if (activeSubPanel === "meta_fields") {
      return (
        <div className="space-y-4">
          {renderBackButton()}
          <h3 className="text-lg font-semibold">Meta Fields</h3>

          <FormField
            control={form.control}
            name="meta_fields"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Fields (JSON)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='{
  "key1": "value1",
  "key2": "value2"
}'
                    className="font-mono text-sm h-60 resize-none"
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Add JSON if you have to pass any extra data
                </p>
              </FormItem>
            )}
          />
        </div>
      );
    }

    // Main panel (default view)
    return (
      <div className="space-y-4">
        <Accordion type="single" collapsible className="w-full space-y-3">
          {/* Details section */}
          <AccordionItem value="details" defaultChecked className="border-b">
            <AccordionTrigger className="text-base font-medium hover:no-underline px-4 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white rounded-md">
              <div className="flex items-center">
                <FileEdit className="h-4 w-4 mr-2" />
                Details
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                {/* Creation and update info */}
                <div>
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
                <div>
                  <h3 className="text-sm font-medium mb-1">Publication Date</h3>
                  <DatePicker
                    selected={publishedDate}
                    onSelect={handleDateSelect}
                  />
                </div>

                {/* Authors */}
                <FormField
                  control={form.control}
                  name="authors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authors</FormLabel>
                      <FormControl>
                        <Selector
                          mode="multiple"
                          display="display_name"
                          action="Authors"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Language */}
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select
                        value={field.value || "English"}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedLanguage(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languageOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <FormControl>
                        <MediaSelector
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Featured Toggle */}
                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Mark as Featured</FormLabel>
                      </div>
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
                  name="is_exclude_from_homepage"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Exclude from Homepage</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Other Details section */}
          <AccordionItem value="other-details" className="border-b">
            <AccordionTrigger className="text-base font-medium hover:no-underline px-4 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white rounded-md">
              <div className="flex items-center">
                <FileEdit className="h-4 w-4 mr-2" />
                Other Details
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Subtitle" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Excerpt"
                          className="resize-none h-24"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="custom_format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Format</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Custom format" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Categories section */}
          <AccordionItem value="categories" className="border-b">
            <AccordionTrigger className="text-base font-medium hover:no-underline px-4 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white rounded-md">
              <div className="flex items-center">
                <FolderClosed className="h-4 w-4 mr-2" />
                Categories
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="categories"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Selector
                          mode="multiple"
                          action="Categories"
                          placeholder="Select categories"
                          value={field.value}
                          onChange={field.onChange}
                          createEntity="Category"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Tags section */}
          <AccordionItem value="tags" className="border-b">
            <AccordionTrigger className="text-base font-medium hover:no-underline px-4 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white rounded-md">
              <div className="flex items-center">
                <Tags className="h-4 w-4 mr-2" />
                Tags
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Selector
                          mode="multiple"
                          action="Tags"
                          placeholder="Select tags"
                          value={field.value}
                          onChange={field.onChange}
                          createEntity="Tag"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Others section */}
          <AccordionItem value="others" className="border-b">
            <AccordionTrigger className="text-base font-medium hover:no-underline px-4 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white rounded-md">
              <div className="flex items-center">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Others
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-start"
                  onClick={() => setActiveSubPanel("seo")}
                >
                  <FileSearch className="h-4 w-4 mr-2" />
                  SEO Settings
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-start"
                  onClick={() => setActiveSubPanel("code")}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Code Injection
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-start"
                  onClick={() => setActiveSubPanel("meta_fields")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Meta Fields
                </Button>

                {data.schemas && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setSchemaPanelOpen(true)}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    View Schemas
                  </Button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Schema Dialog */}
        <Dialog open={schemaPanelOpen} onOpenChange={setSchemaPanelOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>View Schemas</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.schemas &&
                data.schemas.map((schema, index) => (
                  <div
                    key={index}
                    className="rounded-md bg-muted p-3 overflow-x-auto"
                  >
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(schema, null, 2)}
                    </pre>
                  </div>
                ))}
            </div>
            <DialogFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => data.schemas && copySchema(data.schemas)}
              >
                Copy
              </Button>
              <Button
                as="a"
                href="https://search.google.com/test/rich-results"
                target="_blank"
                rel="noreferrer noopener"
              >
                Test in Google Rich Results
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background border-l shadow-lg overflow-y-auto
      transform transition-transform duration-500 ease-in-out ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {activeSubPanel === "seo"
              ? "SEO Settings"
              : activeSubPanel === "code"
              ? "Code Injection"
              : activeSubPanel === "meta_fields"
              ? "Meta Fields"
              : "Post Settings"}
          </h3>
          <Button variant="outline" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-y-auto flex-grow">
          <Form {...form}>
            <form className="space-y-4">{renderPanel()}</form>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default PostSidePanel;
