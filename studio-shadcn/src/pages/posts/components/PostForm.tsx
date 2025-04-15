import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Lucide icons
import { ChevronDown, PanelRightDashed } from "lucide-react";

// Custom components and utilities
import { maker } from "../../../utils/sluger";
import { addTemplate } from "../../../actions/posts";
import useNavigation from "../../../utils/useNavigation";
import PostSidePanel from "./PostSidePanel";
import { renderStatusBadge } from "../../../components/statusBadge/index";
import { DescriptionInput } from "../../../components/FormItems";
import { formatDate } from "../../../utils/date";

// TypeScript interfaces
export interface Author {
  id: number;
  display_name: string;
}

export interface Format {
  id: number;
}

export interface PostData {
  id?: number;
  title?: string;
  slug?: string;
  status?: string;
  published_date?: string | null;
  author_ids?: number[];
  authors?: number[];
  created_at?: string;
  updated_at?: string;
  format_id?: number;
  description_html?: string; // Added for rich text editor content
  meta?: {
    title?: string;
    description?: string;
    canonical_URL?: string;
  };
  schemas?: any[];
  language?: string;
}

interface PostFormProps {
  onCreate: (data: PostData) => void;
  data?: PostData;
  format: Format;
  page?: boolean;
}

function PostForm({
  onCreate,
  data = {},
  format,
  page = false,
}: PostFormProps) {
  const navigate = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<string>(data.status || "draft");
  const dispatch = useDispatch();
  const [valueChange, setValueChange] = useState<boolean>(false);
  const [shouldBlockNavigation, setShouldBlockNavigation] =
    useState<boolean>(false);

  // Initialize publishedDate from data if available
  const [publishedDate, setPublishedDate] = useState<Date | undefined>(
    data.published_date ? new Date(data.published_date) : undefined
  );

  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);

  // Initialize form with serialized dates
  const formData = { ...data };

  // Don't store dayjs objects in the form
  if (
    formData.published_date &&
    typeof formData.published_date === "object" &&
    formData.published_date.$d
  ) {
    formData.published_date = dayjs(formData.published_date).format(
      "YYYY-MM-DDTHH:mm:ssZ"
    );
  }

  // Initialize form
  const form = useForm<PostData>({
    defaultValues: formData,
  });

  const getCurrentDate = (): string => {
    return dayjs().format("YYYY-MM-DDTHH:mm:ssZ");
  };

  // Add a flag to prevent duplicate submissions
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const onSave = (values: PostData, statusOverride?: string) => {
    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log("Preventing duplicate submission");
      return;
    }

    setIsSubmitting(true);

    // Create a new object to avoid mutating the original values
    const finalData: PostData = { ...values };

    // Use the statusOverride if provided, otherwise use the component's status state
    const finalStatus = statusOverride || status;

    // Add any missing properties from the original data
    for (const key in data) {
      if (
        Object.prototype.hasOwnProperty.call(data, key) &&
        key !== "published_date"
      ) {
        if (!Object.prototype.hasOwnProperty.call(finalData, key)) {
          finalData[key as keyof PostData] = data[key as keyof PostData];
        }
      }
    }

    setShouldBlockNavigation(false);
    finalData.format_id = format.id;
    finalData.author_ids = finalData.authors || [];
    finalData.status = finalStatus;

    if (finalStatus === "publish") {
      finalData.published_date = publishedDate
        ? dayjs(publishedDate).format("YYYY-MM-DDTHH:mm:ssZ")
        : getCurrentDate();
    } else if (finalStatus === "future") {
      finalData.published_date = publishedDate
        ? dayjs(publishedDate).format("YYYY-MM-DDTHH:mm:ssZ")
        : null;
    } else {
      finalData.published_date = null;
    }

    try {
      onCreate(finalData);
      // Close panel if open
      handlePanelClose();
    } finally {
      // Reset the submitting state after a short delay
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    }
  };

  const onTitleChange = (value: string) => {
    if (status !== "publish") {
      form.setValue("slug", maker(value));
    }
  };

  const createTemplate = () => {
    if (data && data.id) {
      dispatch(addTemplate({ post_id: parseInt(data.id.toString()) })).then(
        () => {
          page ? navigate("/pages") : navigate("/posts");
        }
      );
    }
  };

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

  useEffect(() => {
    if (publishedDate) {
      const dateString = dayjs(publishedDate).format("YYYY-MM-DDTHH:mm:ssZ");
      form.setValue("published_date", dateString);
      setValueChange(true);
    }
  }, [publishedDate, form]);

  return (
    <>
      <div
        className={`transition-all duration-300 ${
          activePanel ? "blur-sm pointer-events-none" : ""
        }`}
      >
        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit((values) => onSave(values))}
            onChange={() => {
              setShouldBlockNavigation(true);
              setValueChange(true);
            }}
            className="w-full max-w-full edit-form"
          >
            <div className="space-y-4 relative">
              <div className="flex justify-end mb-4 pb-4 border-b">
                <div className="space-x-2 flex items-center">
                  {data.id && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={createTemplate}
                    >
                      Create Template
                    </Button>
                  )}

                  {/* Settings button (PanelRightDashed) */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePanelOpen("main");
                    }}
                    type="button"
                  >
                    <PanelRightDashed className="h-4 w-4" />
                  </Button>

                  {/* Save as Draft button */}
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!valueChange}
                    onClick={() => {
                      const newStatus = "draft";
                      setStatus(newStatus);
                      form.handleSubmit((values) =>
                        onSave(values, newStatus)
                      )();
                    }}
                  >
                    Save as Draft
                  </Button>

                  {/* Publish dropdown button */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button disabled={!valueChange}>
                        <span>
                          {data.id && status === "publish"
                            ? "Update Post"
                            : "Publish Post"}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                      <DropdownMenuItem
                        disabled={!valueChange}
                        onClick={() => {
                          const newStatus = "publish";
                          setStatus(newStatus);
                          form.handleSubmit((values) =>
                            onSave(values, newStatus)
                          )();
                        }}
                      >
                        Publish
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!valueChange}
                        onClick={() => {
                          const newStatus = "ready";
                          setStatus(newStatus);
                          form.handleSubmit((values) =>
                            onSave(values, newStatus)
                          )();
                        }}
                      >
                        Ready to Publish
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!valueChange}
                        onClick={() => {
                          const newStatus = "future";
                          setStatus(newStatus);
                          form.handleSubmit((values) =>
                            onSave(values, newStatus)
                          )();
                        }}
                      >
                        Future Publish
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid grid-cols-1">
                <div className="mx-auto w-full lg:w-2/3">
                  {/* Status badge and Last Updated */}
                  <div className="flex justify-between items-center pb-4">
                    <div>{renderStatusBadge(status)}</div>
                    {data.updated_at && (
                      <div className="text-sm text-muted-foreground">
                        Last updated on:{" "}
                        {formatDate(data.updated_at, "DD MMM YYYY")}
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    rules={{
                      required: "Please input the title!",
                      maxLength: {
                        value: 500,
                        message: "Title must be maximum 500 characters.",
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={`Add title for the ${
                              page ? "page" : "post"
                            }`}
                            onChange={(e) => {
                              field.onChange(e);
                              onTitleChange(e.target.value);
                            }}
                            className="text-4xl font-bold text-start resize-none border"
                            style={{ minHeight: "60px" }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Description Editor */}
                  <div className="mt-6">
                    <DescriptionInput
                      initialValue={data.description_html}
                      noLabel
                      formItemProps={{ className: "post-description" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>

      {activePanel && (
        <PostSidePanel
          form={form}
          data={data}
          status={status}
          setStatus={setStatus}
          valueChange={valueChange}
          publishedDate={publishedDate}
          setPublishedDate={setPublishedDate}
          onSave={onSave}
          onClose={handlePanelClose}
          isVisible={isPanelVisible}
        />
      )}
    </>
  );
}

export default PostForm;
