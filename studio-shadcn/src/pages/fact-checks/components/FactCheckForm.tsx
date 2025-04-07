import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useAppDispatch } from "@/hooks/reduxHooks";

// Lucide Icons
import { PanelRightDashed, X } from "lucide-react";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
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
import { formatDate, getDatefromStringWithoutDay } from "@/utils/date";
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
      {activePanel && (
        <RightPanel
          activePanel={activePanel}
          closePanel={() => setActivePanel(null)}
          form={form}
          data={data}
          onSave={onSave}
          setActivePanel={setActivePanel}
        />
      )}

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
            <div className="flex justify-start">
              {renderStatusBadge(status)}
            </div>

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
