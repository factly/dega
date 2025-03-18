import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useAppDispatch } from "@/hooks/reduxHooks";

// Lucide Icons
import {
  Check,
  ChevronLeft,
  Clock,
  FileSearch,
  MoreHorizontal,
  PanelRightDashed,
  X,
} from "lucide-react";

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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/DatePicker";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";

// Actions and Utils
import { createClaim, updateClaim } from "@/actions/claims";
import { addTemplate } from "@/actions/posts";
import { addErrorNotification } from "@/actions/notifications";
import { formatDate, getDatefromStringWithoutDay } from "@/utils/date";
import getJsonValue from "@/utils/getJsonValue";
import { maker } from "@/utils/sluger";

// Custom Components
import { SlugInput } from "@/components/FormItems";
import MediaSelector from "@/components/MediaSelector";
import MonacoEditor from "@/components/MonacoEditor";
import Selector from "@/components/Selector";
import ClaimCreateForm from "../../claims/components/ClaimForm";
import ClaimList from "./ClaimList";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// TypeScript Interfaces
interface Claim {
  id: number;
  claim: string;
  [key: string]: any;
}

interface FactCheckData {
  id?: number;
  title?: string;
  slug?: string;
  subtitle?: string;
  excerpt?: string;
  description_html?: string;
  description?: {
    json: any;
  };
  status?: string;
  claims?: number[];
  claim_order?: number[];
  featured_medium_id?: number;
  authors?: number[];
  categories?: number[];
  tags?: number[];
  published_date?: string | null;
  created_at?: string;
  updated_at?: string;
  meta?: {
    title?: string;
    description?: string;
    canonical_URL?: string;
  };
  meta_fields?: string | object;
  header_code?: string;
  footer_code?: string;
  schemas?: any[];
}

interface FactCheckFormProps {
  onCreate: (values: any) => void;
  data?: FactCheckData;
  format: {
    id: number;
    name?: string;
  };
}

// Form validation schema
const factCheckSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(500, "Title must be maximum 500 characters"),
  slug: z.string().min(1, "Slug is required"),
  subtitle: z.string().optional(),
  excerpt: z
    .string()
    .max(5000, "Excerpt must be a maximum of 5000 characters")
    .optional(),
  description: z.any().optional(),
  claims: z.array(z.number()).optional(),
  featured_medium_id: z.number().optional(),
  authors: z.array(z.number()).optional(),
  categories: z.array(z.number()).optional(),
  tags: z.array(z.number()).optional(),
  published_date: z.any().optional(),
  meta: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      canonical_URL: z.string().optional(),
    })
    .optional(),
  meta_fields: z.any().optional(),
  header_code: z.string().optional(),
  footer_code: z.string().optional(),
});

const FactCheckForm: React.FC<FactCheckFormProps> = ({
  onCreate,
  data = {},
  format,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<string>(data.status || "draft");
  const [claimCreatedFlag, setClaimCreatedFlag] = useState<boolean>(false);
  const [newClaim, setNewClaim] = useState<any>(null);
  const [valueChange, setValueChange] = useState<boolean>(false);
  const [shouldBlockNavigation, setShouldBlockNavigation] =
    useState<boolean>(false);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);

  // Panel states - replacing drawers
  const [activePanel, setActivePanel] = useState<string | null>(null);

  // Modal and Popover states
  const [claimPopoverOpen, setClaimPopoverOpen] = useState<boolean>(false);
  const [schemaModalOpen, setSchemaModalOpen] = useState<boolean>(false);

  const [claimID, setClaimID] = useState<number>(0);
  const [claimOrder, setClaimOrder] = useState<number[]>(
    data.claims && data.claims.length > 0 ? data.claim_order || [] : []
  );

  // Redux selectors
  const { details, loading } = useSelector((state: any) => ({
    details: state.claims.details,
    loading: state.claims.loading,
  }));

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof factCheckSchema>>({
    resolver: zodResolver(factCheckSchema),
    defaultValues: {
      ...data,
      published_date: data.published_date
        ? dayjs(data.published_date).toDate()
        : undefined,
      meta_fields:
        typeof data.meta_fields === "string"
          ? data.meta_fields
          : data.meta_fields
          ? JSON.stringify(data.meta_fields)
          : undefined,
    },
  });

  // Set up form value change monitoring
  useEffect(() => {
    const subscription = form.watch(() => {
      setShouldBlockNavigation(true);
      setValueChange(true);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Update form when new claim is created
  useEffect(() => {
    if (claimCreatedFlag && newClaim) {
      if (data && data.id) {
        // For existing records, we'll handle this in the component update
        data.claims = [...(data.claims || []), newClaim.id];
      } else {
        // For new records
        const claimList = form.getValues("claims") || [];
        form.setValue("claims", [...claimList, newClaim.id]);
        setValueChange(true); // Ensure Save button is enabled
      }
      setClaimCreatedFlag(false);
    }
  }, [claimCreatedFlag, newClaim, data, form]);

  // Window resize handler for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldBlockNavigation) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shouldBlockNavigation]);

  const getCurrentDate = () => {
    return dayjs().format("YYYY-MM-DDTHH:mm:ssZ");
  };

  const onSave = (values: z.infer<typeof factCheckSchema>) => {
    setShouldBlockNavigation(false);

    // Create a new object to avoid mutating the form values
    const processedValues = { ...values };

    // Ensure meta_fields is properly formatted
    if (processedValues.meta_fields) {
      processedValues.meta_fields = getJsonValue(processedValues.meta_fields);
    }

    // Set all the required IDs correctly
    processedValues.category_ids = processedValues.categories || [];
    processedValues.tag_ids = processedValues.tags || [];
    processedValues.format_id = format.id;

    // Fix: Make sure author_ids is properly set
    processedValues.author_ids = processedValues.authors || [];

    // Fix: Make sure claim_ids uses the correct order from claimOrder
    processedValues.claim_ids = processedValues.claims ? claimOrder : [];
    processedValues.claim_order = processedValues.claim_ids;

    // Set status before validation checks
    processedValues.status = status;

    // IMPORTANT: Explicit author validation check
    // This must happen before we proceed with publish or future statuses
    if (status === "publish" || status === "future") {
      if (
        !processedValues.author_ids ||
        !Array.isArray(processedValues.author_ids) ||
        processedValues.author_ids.length === 0
      ) {
        dispatch(
          addErrorNotification(
            "At least one author must be assigned before publishing."
          )
        );
        return; // Prevent form submission if no authors
      }
    }

    // Future publish date validation
    if (status === "future" && !processedValues.published_date) {
      dispatch(
        addErrorNotification(
          "Published date is required for future publishing."
        )
      );
      return;
    }

    // Format publish date
    if (status === "publish") {
      processedValues.published_date = processedValues.published_date
        ? dayjs(processedValues.published_date).format("YYYY-MM-DDTHH:mm:ssZ")
        : getCurrentDate();
    } else if (status === "future") {
      // Ensure future date is properly formatted
      processedValues.published_date = dayjs(
        processedValues.published_date
      ).format("YYYY-MM-DDTHH:mm:ssZ");
    } else {
      processedValues.published_date = null;
    }

    console.log("Submitting fact check with values:", processedValues);

    // Call the onCreate function with the processed values
    onCreate(processedValues);
    setValueChange(false); // Reset value change after save
  };

  const onTitleChange = (value: string) => {
    if (status !== "publish") {
      form.setValue("slug", maker(value));
      setValueChange(true);
    }
  };

  const copySchema = async (textToCopy: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
        return true;
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        textArea.remove();

        return successful;
      }
    } catch (error) {
      console.error("Failed to copy text: ", error);
      return false;
    }
  };

  const handleClaimSubmit = (values: any) => {
    if (claimID > 0) {
      dispatch(updateClaim({ ...details[claimID], ...values }))
        .then(() => {
          setClaimPopoverOpen(false);
          setClaimID(0);
          setValueChange(true); // Ensure Save button is enabled
        })
        .catch((error: any) => {
          console.error("Error updating claim:", error);
        });
    } else {
      dispatch(createClaim(values))
        .then((claim: any) => {
          setClaimPopoverOpen(false);
          setNewClaim(claim);
          setClaimID(0);
          setClaimCreatedFlag(true);
          setValueChange(true); // Ensure Save button is enabled
        })
        .catch((error: any) => {
          console.error("Error creating claim:", error);
        });
    }
  };

  const createTemplate = () => {
    if (data.id) {
      dispatch(addTemplate({ post_id: data.id }))
        .then(() => navigate("/fact-checks"))
        .catch((error: any) => {
          console.error("Error creating template:", error);
        });
    }
  };

  const setReadyFlag = () => {
    setStatus(status === "ready" ? "draft" : "ready");
    setValueChange(true); // Ensure Save button is enabled
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  const handleFormChange = (changedValues: any) => {
    setShouldBlockNavigation(true);
    setValueChange(true);

    // Update claim order if claims have changed
    if (changedValues.claims) {
      if (claimOrder.length < changedValues.claims.length) {
        setClaimOrder([
          ...claimOrder,
          ...changedValues.claims.filter(
            (x: number) => !claimOrder.includes(x)
          ),
        ]);
      } else {
        setClaimOrder(
          claimOrder.filter((x: number) => changedValues.claims.includes(x))
        );
      }
    }
  };

  // Helper function to get status badge
  const renderStatusBadge = () => {
    if (status === "publish") {
      return (
        <Badge className="flex gap-1 items-center">
          <Check className="h-3 w-3" /> Published
        </Badge>
      );
    } else if (status === "draft") {
      return (
        <Badge variant="destructive" className="flex gap-1 items-center">
          <X className="h-3 w-3" /> Draft
        </Badge>
      );
    } else if (status === "ready") {
      return (
        <Badge className="flex gap-1 items-center">
          <Clock className="h-3 w-3" /> Ready to Publish
        </Badge>
      );
    }
    return null;
  };

  // The right panel content based on active panel
  const renderRightPanel = () => {
    if (!activePanel) return null;

    return (
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background border-l shadow-lg transform transition-transform duration-300 overflow-y-auto">
        <div className="p-4 h-full flex flex-col">
          {activePanel === "main" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Post Settings</h3>
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
                    <Accordion type="single" collapsible defaultValue="details">
                      {/* Details Section */}
                      <AccordionItem value="details">
                        <AccordionTrigger>General</AccordionTrigger>
                        <AccordionContent>
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

                            {/* Add Claim Button (now just opens left side popover) */}
                            <Button
                              type="button"
                              onClick={() => {
                                setClaimID(0);
                                setClaimPopoverOpen(true);
                              }}
                            >
                              Add Claim
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Other Details Section */}
                      <AccordionItem value="other-details">
                        <AccordionTrigger>Other Details</AccordionTrigger>
                        <AccordionContent>
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
                      <AccordionItem value="categories">
                        <AccordionTrigger>Categories</AccordionTrigger>
                        <AccordionContent>
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
                      <AccordionItem value="tags">
                        <AccordionTrigger>Tags</AccordionTrigger>
                        <AccordionContent>
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

                    {/* SEO Button */}
                    <button
                      type="button"
                      className="flex items-center w-full text-left"
                      onClick={() => setActivePanel("meta")}
                    >
                      <FileSearch className="h-4 w-4 mr-2" />
                      <span className="font-medium">SEO</span>
                    </button>

                    <Separator />

                    {/* Others Section */}
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center w-full text-left">
                        <MoreHorizontal className="h-4 w-4 mr-2" />
                        <span className="font-medium">Others</span>
                      </CollapsibleTrigger>
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
                          onClick={() => setSchemaModalOpen(true)}
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

                    <SlugInput form={form} />

                    <FormField
                      control={form.control}
                      name="meta.title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Title</FormLabel>
                          <Input {...field} />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="meta.description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description</FormLabel>
                          <Textarea
                            {...field}
                            className="resize-none"
                            rows={4}
                          />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="meta.canonical_URL"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Canonical URL</FormLabel>
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
                      className="flex items-center gap-1"
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

  // LEFT SIDE CLAIM PANEL - This is the new component
  const renderLeftClaimPanel = () => {
    if (!claimPopoverOpen) return null;

    return (
      <div className="fixed inset-y-0 left-0 z-50 w-full max-w-md bg-background border-r shadow-lg transform transition-transform duration-300 overflow-y-auto">
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {claimID > 0 ? "Edit Claim" : "Add New Claim"}
            </h3>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setClaimPopoverOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="overflow-y-auto flex-grow">
            <ClaimCreateForm
              data={details?.[claimID]}
              onCreate={handleClaimSubmit}
              compact={true}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Schema Modal */}
      <Dialog open={schemaModalOpen} onOpenChange={setSchemaModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Schemas</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-96">
            {data.schemas?.map((schema, index) => (
              <div
                key={index}
                className="my-2 p-2 bg-muted rounded-md font-mono text-sm"
              >
                {`<script type="application/ld+json">${JSON.stringify(
                  schema
                )}</script>`}
              </div>
            ))}
          </div>
          <DialogFooter>
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
            <a
              href="https://search.google.com/test/rich-results"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Test in Google Rich Results
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Left side claim panel */}
      {renderLeftClaimPanel()}

      {/* Right side panel */}
      {renderRightPanel()}

      {/* Main Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSave)}
          onChange={() => setValueChange(true)}
          className="edit-form space-y-6"
        >
          {/* Header with Actions */}
          <div className="flex justify-between items-center space-x-2">
            {/* Status Badge - Move it to the left */}
            <div className="flex justify-start">{renderStatusBadge()}</div>

            <div className="flex space-x-2">
              {data.id && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={createTemplate}
                >
                  Create Template
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActivePanel("main");
                }}
              >
                <PanelRightDashed className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!valueChange}
                    onClick={(e) => {
                      e.preventDefault();
                      setStatus(status === "ready" ? "ready" : "draft");
                      form.handleSubmit(onSave)(e);
                    }}
                  >
                    Save
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setReadyFlag()}>
                    <div className="flex items-center justify-between w-full">
                      <span>Ready to Publish</span>
                      <Switch
                        checked={status === "ready"}
                        onCheckedChange={setReadyFlag}
                      />
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                type="button"
                className="bg-[#DCEFEB] text-normal"
                onClick={(e) => {
                  e.preventDefault();

                  // Basic check for required fields
                  const currentValues = form.getValues();

                  if (!currentValues.title || !currentValues.slug) {
                    dispatch(
                      addErrorNotification(
                        "Title and slug are required fields."
                      )
                    );
                    return;
                  }

                  // Check for authors before attempting to publish
                  const authors = currentValues.authors || [];
                  if (authors.length === 0) {
                    dispatch(
                      addErrorNotification(
                        "At least one author must be assigned before publishing."
                      )
                    );
                    return;
                  }

                  // Bypass form validation and directly prepare publish data
                  setStatus("publish");

                  // Manually prepare the data instead of using form.handleSubmit
                  const processedValues = { ...currentValues };

                  // Format the data correctly
                  if (processedValues.meta_fields) {
                    processedValues.meta_fields = getJsonValue(
                      processedValues.meta_fields
                    );
                  }

                  processedValues.category_ids =
                    processedValues.categories || [];
                  processedValues.tag_ids = processedValues.tags || [];
                  processedValues.format_id = format.id;
                  processedValues.author_ids = processedValues.authors || [];
                  processedValues.claim_ids = processedValues.claims
                    ? claimOrder
                    : [];
                  processedValues.claim_order = processedValues.claim_ids;
                  processedValues.status = "publish";

                  // Format publish date
                  processedValues.published_date =
                    processedValues.published_date
                      ? dayjs(processedValues.published_date).format(
                          "YYYY-MM-DDTHH:mm:ssZ"
                        )
                      : getCurrentDate();

                  console.log("Publishing with values:", processedValues);

                  // Directly call onCreate
                  onCreate(processedValues);
                  setValueChange(false);
                }}
              >
                {data?.id && status === "publish"
                  ? "Update Fact-Check"
                  : "Publish Fact-Check"}
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="max-w-4xl mx-auto">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <Textarea
                    {...field}
                    className="border text-4xl font-bold text-start resize-none"
                    placeholder="Add title for the fact-check"
                    onChange={(e) => {
                      field.onChange(e);
                      onTitleChange(e.target.value);
                    }}
                    rows={2}
                  />
                </FormItem>
              )}
            />

            {/* Last Updated */}
            {data?.updated_at && (
              <p className="text-lg text-muted-foreground text-center">
                Last updated on: {getDatefromStringWithoutDay(data.updated_at)}
              </p>
            )}

            {/* Claims List */}
            {form.watch("claims")?.length > 0 && !loading && (
              <div className="my-4">
                <ClaimList
                  ids={form.getValues("claims")}
                  setClaimID={setClaimID}
                  showModal={() => setClaimPopoverOpen(true)}
                  details={details}
                  claimOrder={claimOrder}
                  setClaimOrder={setClaimOrder}
                />
              </div>
            )}
          </div>
        </form>
      </Form>
    </>
  );
};

export default FactCheckForm;
