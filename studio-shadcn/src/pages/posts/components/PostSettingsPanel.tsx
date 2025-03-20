// PostSettingsPanel.tsx
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/DatePicker";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronDown,
  Menu,
  CheckCircle,
  AlertCircle,
  Clock,
  LayoutGrid,
  Tags,
  Search,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import Selector from "../../../components/Selector";
import MediaSelector from "../../../components/MediaSelector";
import MonacoEditor from "../../../components/MonacoEditor";
import { formatDate } from "../../../utils/date";
import { SlugInput } from "../../../components/FormItems";
import languages from "../../../utils/languages.json";
import dayjs from "dayjs";
import { UseFormReturn } from "react-hook-form";

// types
export interface Post {
  id?: number;
  title?: string;
  slug?: string;
  status?: "draft" | "ready" | "publish" | "future";
  description_html?: string;
  excerpt?: string;
  subtitle?: string;
  featured_medium_id?: number;
  is_featured?: boolean;
  is_exclude_from_homepage?: boolean;
  published_date?: string | null;
  created_at?: string;
  updated_at?: string;
  category_ids?: number[];
  categories?: number[];
  tag_ids?: number[];
  tags?: number[];
  format_id?: number;
  author_ids?: number[];
  authors?: number[];
  meta?: {
    title?: string;
    description?: string;
    canonical_URL?: string;
  };
  header_code?: string;
  footer_code?: string;
  meta_fields?: string;
  custom_format?: string;
  language?: string;
  schemas?: any[];
}

export interface Format {
  id: number;
  name?: string;
}

interface RightPanelProps {
  open: boolean;
  onClose: () => void;
  form: UseFormReturn<any, any, undefined>;
  formRef: React.RefObject<HTMLFormElement>;
  data: Post;
  onSave: (values: any) => void;
  setStatus: (status: "draft" | "ready" | "publish" | "future") => void;
  status: string;
  valueChange: boolean;
  isMobileScreen: boolean;
  createTemplate?: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  open,
  onClose,
  form,
  formRef,
  data,
  onSave,
  setStatus,
  status,
  valueChange,
  isMobileScreen,
}) => {
  const [codeDrawer, setCodeDrawerVisible] = useState(false);
  const [metaFieldsDrawer, setMetaFieldsDrawerVisible] = useState(false);
  const [seoDrawer, setSeoDrawerVisible] = useState(false);
  const [isSchemaModalVisible, setIsSchemaModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(data.language || "English");

  const languagesList = languages.map((language: string) => ({
    value: language,
    label: language,
  }));

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    form.setValue("language", value);
  };

  const copySchema = (textToCopy: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(textToCopy);
    } else {
      let textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      return new Promise<void>((res, rej) => {
        document.execCommand("copy") ? res() : rej();
        textArea.remove();
      });
    }
  };

  const getCurrentDate = () => {
    return dayjs().format('YYYY-MM-DDTHH:mm:ssZ');
  };

  const postActions = [
    {
      key: "draft",
      label: "Save Draft",
      onClick: () => {
        setStatus("draft");
        // Get current form values and directly call onSave
        const formValues = form.getValues();
        onSave(formValues);
      },
      disabled: !valueChange,
    },
    {
      key: "ready",
      label: "Ready to Publish",
      onClick: () => {
        setStatus("ready");
        // Get current form values and directly call onSave
        const formValues = form.getValues();
        onSave(formValues);
      },
      disabled: !valueChange,
    },
    {
      key: "future",
      label: "Future Publish",
      onClick: () => {
        // Check if we have a published date
        const publishedDate = form.getValues('published_date');
        if (!publishedDate) {
          alert('Published date is required for future publishing.');
          return;
        }
        
        setStatus("future");
        // Get current form values and directly call onSave
        const formValues = form.getValues();
        onSave(formValues);
      },
      disabled: !valueChange,
    },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
          <SheetHeader className="pr-8">
            <SheetTitle className="flex justify-between items-center">
              Settings
                <div className="flex items-center">
                  <Button 
                    type="button"
                    onClick={() => {
                      // Only check for authors if we're publishing
                      const currentAuthors = form.getValues('authors') || [];
                      if (currentAuthors.length === 0) {
                        // We can't directly access dispatch here, but we can show a UI error
                        alert('At least one author must be assigned for publishing.');
                        return;
                      }
                      
                      setStatus("publish");
                      // Get current form values and prepare for save
                      const formValues = form.getValues();
                      
                      // Set published date for immediate publishing if not already set
                      if (!formValues.published_date) {
                        form.setValue('published_date', getCurrentDate());
                      }
                      
                      onSave(formValues);
                    }}
                    className="rounded-r-none border-r-0"
                    size="sm"
                  >
                    <span>
                      {data?.id && status === "publish" ? "Update" : "Publish"}
                    </span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        type="button"
                        className="px-2 rounded-l-none"
                        variant="default"
                        size="sm"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {postActions.map((action) => (
                        <DropdownMenuItem
                          key={action.key}
                          onClick={action.onClick}
                          disabled={action.disabled}
                        >
                          {action.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <Accordion type="single" collapsible defaultValue="details">
              <AccordionItem value="details">
                <AccordionTrigger className="flex items-center">
                  <div className="flex items-center">
                    <Menu className="h-4 w-4 mr-2" />
                    Details
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 py-2">
                    {data?.created_at && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">
                          Created Date:{" "}
                        </span>
                        {formatDate(data.created_at)}
                      </div>
                    )}

                    {data?.updated_at && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">
                          Last updated:{" "}
                        </span>
                        {formatDate(data.updated_at)}
                      </div>
                    )}

                    <div className="mt-2">
                      {status === "publish" && (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 border-green-300"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" /> Published
                        </Badge>
                      )}
                      {status === "draft" && (
                        <Badge
                          variant="outline"
                          className="bg-red-100 text-red-800 border-red-300"
                        >
                          <AlertCircle className="h-3 w-3 mr-1" /> Draft
                        </Badge>
                      )}
                      {status === "ready" && (
                        <Badge
                          variant="outline"
                          className="bg-yellow-100 text-yellow-800 border-yellow-300"
                        >
                          <Clock className="h-3 w-3 mr-1" /> Ready to Publish
                        </Badge>
                      )}
                      {status === "future" && (
                        <Badge
                          variant="outline"
                          className="bg-yellow-100 text-yellow-800 border-yellow-300"
                        >
                          <Clock className="h-3 w-3 mr-1" /> Future Publish
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="published_date">
                        Published Date
                        {status === 'future' && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>
                      <DatePicker
                        date={
                          data.published_date
                            ? new Date(data.published_date)
                            : undefined
                        }
                        onSelect={(date) => {
                          // Format the date properly before setting it
                          form.setValue("published_date", date ? dayjs(date).format('YYYY-MM-DDTHH:mm:ssZ') : null);
                        }}
                      />
                      {status === 'future' && !data.published_date && (
                        <p className="text-sm text-red-500 mt-1">
                          Published date is required for future publishing
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="authors">
                        Authors
                        {(status === 'publish' || status === 'future') && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>
                      <Selector
                        mode="multiple"
                        display="display_name"
                        action="Authors"
                        value={data.authors || []}
                        onChange={(value) => {
                          form.setValue("authors", value);
                          // Also update author_ids to ensure consistent state
                          form.setValue("author_ids", value);
                        }}
                      />
                      {(status === 'publish' || status === 'future') && 
                       (!data.authors || data.authors.length === 0) && 
                       valueChange && (
                        <p className="text-sm text-red-500 mt-1">
                          At least one author is required for publishing
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={selectedLanguage}
                        onValueChange={handleLanguageChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languagesList.map(
                            (language: { value: string; label: string }) => (
                              <SelectItem
                                key={language.value}
                                value={language.value}
                              >
                                {language.label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="featured_medium_id">Featured Image</Label>
                      <MediaSelector
                        value={data.featured_medium_id}
                        onChange={(value) =>
                          form.setValue("featured_medium_id", value)
                        }
                      />
                    </div>

                    <div className="flex items-center space-x-2 py-2">
                      <Switch
                        id="is_featured"
                        checked={data.is_featured}
                        onCheckedChange={(checked) =>
                          form.setValue("is_featured", checked)
                        }
                      />
                      <Label htmlFor="is_featured">Mark as Featured</Label>
                    </div>

                    <div className="flex items-center space-x-2 py-2">
                      <Switch
                        id="is_exclude_from_homepage"
                        checked={data.is_exclude_from_homepage}
                        onCheckedChange={(checked) =>
                          form.setValue(
                            "is_exclude_from_homepage",
                            checked
                          )
                        }
                      />
                      <Label htmlFor="is_exclude_from_homepage">
                        Exclude from Homepage
                      </Label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <Separator className="my-4" />

              <AccordionItem value="other-details">
                <AccordionTrigger className="flex items-center">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Other Details
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        placeholder="Subtitle"
                        value={data.subtitle || ""}
                        onChange={(e) =>
                          form.setValue("subtitle", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        placeholder="Excerpt"
                        className="min-h-[100px]"
                        value={data.excerpt || ""}
                        onChange={(e) =>
                          form.setValue("excerpt", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom_format">Custom Format</Label>
                      <Input
                        id="custom_format"
                        placeholder="Custom format"
                        value={data.custom_format || ""}
                        onChange={(e) =>
                          form.setValue("custom_format", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <Separator className="my-4" />

              <AccordionItem value="categories">
                <AccordionTrigger className="flex items-center">
                  <div className="flex items-center">
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Categories
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 py-2">
                    <Selector
                      mode="multiple"
                      action="Categories"
                      createEntity="Category"
                      value={data.categories}
                      onChange={(value) => form.setValue("categories", value)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <Separator className="my-4" />

              <AccordionItem value="tags">
                <AccordionTrigger className="flex items-center">
                  <div className="flex items-center">
                    <Tags className="h-4 w-4 mr-2" />
                    Tags
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 py-2">
                    <Selector
                      mode="multiple"
                      action="Tags"
                      createEntity="Tag"
                      value={data.tags}
                      onChange={(value) => form.setValue("tags", value)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <Separator className="my-4" />

              <div
                className="flex items-center py-4 px-1 cursor-pointer hover:bg-gray-50 rounded-md"
                onClick={() => setSeoDrawerVisible(true)}
              >
                <Search className="h-4 w-4 mr-2" />
                <span className="font-medium">SEO</span>
              </div>

              <Separator className="my-4" />

              <AccordionItem value="others">
                <AccordionTrigger className="flex items-center">
                  <div className="flex items-center">
                    <MoreHorizontal className="h-4 w-4 mr-2" />
                    Others
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 py-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setCodeDrawerVisible(true)}
                    >
                      Code Injection
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsSchemaModalVisible(true)}
                    >
                      View Schemas
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setMetaFieldsDrawerVisible(true)}
                    >
                      Add Meta Fields
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </SheetContent>
      </Sheet>

      {/* Code Injection Drawer */}
      <Sheet
        open={codeDrawer}
        onOpenChange={(open) => !open && setCodeDrawerVisible(false)}
      >
        <SheetContent className="sm:max-w-md md:max-w-lg">
          <SheetHeader>
            <SheetTitle>Code Injection</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <Button
              variant="ghost"
              className="flex items-center mb-4"
              onClick={() => setCodeDrawerVisible(false)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="header_code">Header Code</Label>
                <MonacoEditor
                  language="html"
                  width={isMobileScreen ? "100%" : 450}
                  value={data.header_code || ""}
                  onChange={(value) => form.setValue("header_code", value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer_code">Footer Code</Label>
                <MonacoEditor
                  language="html"
                  width={isMobileScreen ? "100%" : 450}
                  value={data.footer_code || ""}
                  onChange={(value) => form.setValue("footer_code", value)}
                />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Meta Fields Drawer */}
      <Sheet
        open={metaFieldsDrawer}
        onOpenChange={(open) => !open && setMetaFieldsDrawerVisible(false)}
      >
        <SheetContent className="sm:max-w-md md:max-w-lg">
          <SheetHeader>
            <SheetTitle>Meta Fields</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <Button
              variant="ghost"
              className="flex items-center mb-4"
              onClick={() => setMetaFieldsDrawerVisible(false)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <div className="space-y-2">
              <Label htmlFor="meta_fields">
                Meta Fields
                <span className="block text-sm text-gray-500 font-normal mt-1">
                  Add JSON if you have to pass any extra data
                </span>
              </Label>
              <MonacoEditor
                language="json"
                width={isMobileScreen ? "100%" : 450}
                value={data.meta_fields || ""}
                onChange={(value) => form.setValue("meta_fields", value)}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* SEO Drawer */}
      <Sheet
        open={seoDrawer}
        onOpenChange={(open) => !open && setSeoDrawerVisible(false)}
      >
        <SheetContent className="sm:max-w-md md:max-w-lg">
          <SheetHeader>
            <SheetTitle>SEO Data</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <Button
              variant="ghost"
              className="flex items-center mb-4"
              onClick={() => setSeoDrawerVisible(false)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <div className="space-y-4">
              <SlugInput form={form} />

              <div className="space-y-2">
                <Label htmlFor="meta.title">Meta Title</Label>
                <Input
                  id="meta.title"
                  value={data.meta?.title || ""}
                  onChange={(e) => form.setValue("meta.title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta.description">Meta Description</Label>
                <Textarea
                  id="meta.description"
                  value={data.meta?.description || ""}
                  onChange={(e) =>
                    form.setValue("meta.description", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta.canonical_URL">Canonical URL</Label>
                <Input
                  id="meta.canonical_URL"
                  value={data.meta?.canonical_URL || ""}
                  onChange={(e) =>
                    form.setValue("meta.canonical_URL", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Schema Modal */}
      <Dialog
        open={isSchemaModalVisible}
        onOpenChange={setIsSchemaModalVisible}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>View Schemas</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {data.schemas &&
              data.schemas.map((schema, index) => (
                <pre
                  key={index}
                  className="p-4 mt-2 bg-gray-100 rounded-md text-xs overflow-x-auto"
                >
                  {JSON.stringify(schema, null, 2)}
                </pre>
              ))}
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (data.schemas) {
                  const copyText = data.schemas
                    .map(
                      (schema) =>
                        `<script type="application/ld+json">${JSON.stringify(
                          schema
                        )}</script>`
                    )
                    .join("\n");
                  copySchema(copyText);
                }
              }}
            >
              Copy
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://search.google.com/test/rich-results"
                target="_blank"
                rel="noreferrer noopener"
              >
                Test in Google Rich Results Text
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RightPanel;