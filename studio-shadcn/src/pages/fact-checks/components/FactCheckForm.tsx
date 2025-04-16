import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { PanelRightDashed, X, ChevronDown } from "lucide-react";
// Shadcn Components
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem } from "@/components/ui/form";
// Actions and Utils
import { createClaim, updateClaim } from "@/actions/claims";
import { addTemplate } from "@/actions/posts";
import { addErrorNotification } from "@/actions/notifications";
import { getDatefromStringWithoutDay } from "@/utils/date";
import getJsonValue from "@/utils/getJsonValue";
import { maker } from "@/utils/sluger";
import { renderStatusBadge } from "../../../components/statusBadge/index";
// Custom Components
import ClaimCreateForm from "../../claims/components/ClaimForm";
import ClaimList from "./ClaimList";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import RightPanel from "./RightPanel";
import { DescriptionInput } from "../../../components/FormItems";

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
  status: z.string().optional(),
  format_id: z.number().optional(),
  claim_ids: z.array(z.number()).optional(),
  claim_order: z.array(z.number()).optional(),
});

type FactCheckFormValues = z.infer<typeof factCheckSchema>;

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

  // Panel states with animation controls
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);

  // Modal and Popover states
  const [claimPopoverOpen, setClaimPopoverOpen] = useState<boolean>(false);
  const [schemaModalOpen, setSchemaModalOpen] = useState<boolean>(false);

  const [claimID, setClaimID] = useState<string>("");
  const [claimOrder, setClaimOrder] = useState<string[]>(
    data.claims && data.claims.length > 0
      ? (data.claim_order || []).map((id) => id.toString())
      : []
  );

  // Track when any panel is open to apply blur effect
  const isPanelOpen = activePanel !== null || claimPopoverOpen;

  // Redux selectors
  const { details, loading } = useSelector((state: any) => ({
    details: state.claims.details,
    loading: state.claims.loading,
  }));

  // Initialize form with react-hook-form
  const form = useForm<FactCheckFormValues>({
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
      format_id: format.id, // Add format_id to default values
    },
  });

  // Handle opening and closing the panel with animation
  const handlePanelOpen = (panelName: string) => {
    // First set the panel without making it visible
    setActivePanel(panelName);

    // Add a small delay before making it visible to ensure the DOM is updated
    setTimeout(() => {
      setIsPanelVisible(true);
    }, 50);
  };

  const handlePanelClose = () => {
    setIsPanelVisible(false);
    // Delay removing the panel from DOM until animation completes
    setTimeout(() => {
      setActivePanel(null);
    }, 500); // Match this with transition duration
  };

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

  const onSave = (values: FactCheckFormValues) => {
    setShouldBlockNavigation(false);

    // Create a new object to avoid mutating the form values
    const processedValues = { ...values };

    // Ensure meta_fields is properly formatted
    if (processedValues.meta_fields) {
      processedValues.meta_fields = getJsonValue(processedValues.meta_fields);
    }

    // Set the status explicitly
    processedValues.status = status;

    // Set format_id
    processedValues.format_id = format.id;

    // Convert claimOrder to numbers and set both claim_ids and claim_order
    if (claimOrder && claimOrder.length > 0) {
      const numericClaimIds = claimOrder.map((id) => parseInt(id, 10));
      processedValues.claim_ids = numericClaimIds;
      processedValues.claim_order = numericClaimIds;
    }

    // IMPORTANT: Explicit author validation check
    // This must happen before we proceed with publish status
    if (status === "publish") {
      if (
        !processedValues.authors ||
        !Array.isArray(processedValues.authors) ||
        processedValues.authors.length === 0
      ) {
        dispatch(
          addErrorNotification(
            "At least one author must be assigned before publishing."
          )
        );
        return; // Prevent form submission if no authors
      }
    }

    // Format publish date - only add date for publish status
    if (status === "publish") {
      processedValues.published_date = processedValues.published_date
        ? dayjs(processedValues.published_date).format("YYYY-MM-DDTHH:mm:ssZ")
        : getCurrentDate();
    } else {
      // For draft and ready status, set published_date to null
      processedValues.published_date = null;
    }

    // Call the onCreate function with the processed values
    onCreate(processedValues);
    setValueChange(false); // Reset value change after save

    // Close panel if open
    if (activePanel) {
      handlePanelClose();
    }
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
    if (claimID && parseInt(claimID, 10) > 0) {
      dispatch(updateClaim({ ...details[claimID], ...values }))
        .then(() => {
          setClaimPopoverOpen(false);
          setClaimID("");
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
          setClaimID("");
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

  const renderLeftClaimPanel = () => {
    if (!claimPopoverOpen) return null;

    return (
      <div
        className="fixed inset-y-0 left-0 z-50 w-full max-w-md bg-background border-r shadow-lg transform transition-transform duration-500 overflow-y-auto
      animate-slide-in-left"
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {claimID ? "Edit Claim" : "Add New Claim"}
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
              data={claimID ? details?.[claimID] : undefined}
              onCreate={handleClaimSubmit}
              compact={true}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
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

      {/* Right side panel with animation */}
      {activePanel && (
        <RightPanel
          activePanel={activePanel}
          closePanel={handlePanelClose}
          form={form}
          data={data}
          onSave={onSave}
          setActivePanel={setActivePanel}
          isVisible={isPanelVisible}
        />
      )}

      {/* Main Form with blur effect when panel is open */}
      <div
        className={`transition-all duration-300 ${
          isPanelOpen ? "filter blur-sm pointer-events-none" : ""
        }`}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSave)}
            onChange={() => setValueChange(true)}
            className="edit-form space-y-6"
          >
            {/* Header with Actions */}
            <div className="flex justify-end space-x-2 pb-4 border-b">
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
                    handlePanelOpen("main");
                  }}
                >
                  <PanelRightDashed className="h-4 w-4" />
                </Button>
                {/* Save as Draft button */}
                <Button
                  type="button"
                  variant="outline"
                  disabled={!valueChange}
                  onClick={(e) => {
                    e.preventDefault();

                    // Get current form values
                    const currentValues = form.getValues();
                    form.setValue("status", "draft");
                    form.setValue("format_id", format.id);

                    if (claimOrder && claimOrder.length > 0) {
                      const numericClaimIds = claimOrder.map((id) =>
                        parseInt(id, 10)
                      );
                      form.setValue("claim_ids", numericClaimIds);
                      form.setValue("claim_order", numericClaimIds);
                    }

                    // Set published_date to null for draft
                    form.setValue("published_date", null);

                    // Submit the form
                    form.handleSubmit(onSave)(e);
                  }}
                >
                  Save as Draft
                </Button>
                {/* Publish dropdown button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button disabled={!valueChange}>
                      <span>
                        {data?.id && status === "publish"
                          ? "Update Fact-Check"
                          : "Publish Fact-Check"}
                      </span>
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      disabled={!valueChange}
                      onClick={(e) => {
                        e.preventDefault();

                        // Get current form values for validation
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

                        // Set important fields directly on the form
                        setStatus("publish");
                        form.setValue("status", "publish");
                        form.setValue("format_id", format.id);

                        // Process claim IDs/order
                        if (claimOrder && claimOrder.length > 0) {
                          const numericClaimIds = claimOrder.map((id) =>
                            parseInt(id, 10)
                          );
                          form.setValue("claim_ids", numericClaimIds);
                          form.setValue("claim_order", numericClaimIds);
                        }

                        // Set published_date
                        const publishDate = currentValues.published_date
                          ? dayjs(currentValues.published_date).format(
                              "YYYY-MM-DDTHH:mm:ssZ"
                            )
                          : getCurrentDate();
                        form.setValue("published_date", publishDate);

                        // Submit the form
                        form.handleSubmit(onSave)(e);
                      }}
                    >
                      Publish
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!valueChange}
                      onClick={(e) => {
                        e.preventDefault();

                        // Set important fields directly on the form
                        setStatus("ready");
                        form.setValue("status", "ready");
                        form.setValue("format_id", format.id);

                        // Process claim IDs/order
                        if (claimOrder && claimOrder.length > 0) {
                          const numericClaimIds = claimOrder.map((id) =>
                            parseInt(id, 10)
                          );
                          form.setValue("claim_ids", numericClaimIds);
                          form.setValue("claim_order", numericClaimIds);
                        }

                        // Set published_date to null for ready status
                        form.setValue("published_date", null);

                        // Submit the form
                        form.handleSubmit(onSave)(e);
                      }}
                    >
                      Ready to Publish
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-4xl mx-auto">
              {/* Status Badge */}
              <div className="flex justify-start pb-4">
                {renderStatusBadge(status)}
              </div>
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
                  Last updated on:{" "}
                  {getDatefromStringWithoutDay(data.updated_at)}
                </p>
              )}

              {/* Claims List */}
              {form.watch("claims")?.length > 0 && !loading && (
                <div className="my-4">
                  <ClaimList
                    ids={
                      form.getValues("claims")?.map((id) => id.toString()) || []
                    }
                    setClaimID={(id: string) => setClaimID(id)}
                    showModal={() => setClaimPopoverOpen(true)}
                    details={details}
                    claimOrder={claimOrder}
                    setClaimOrder={(order: string[]) => setClaimOrder(order)}
                  />
                </div>
              )}

              {/* Description Editor */}
              <div className="mt-6">
                <DescriptionInput
                  initialValue={data.description_html}
                  noLabel
                  formItemProps={{ className: "post-description" }}
                />
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default FactCheckForm;
