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
import { Post as PostData, Format } from "../types";
import { useAppDispatch } from "@/hooks/reduxHooks";

// TypeScript interfaces
export interface Author {
  id: number;
  display_name: string;
}

interface PostFormProps {
  onCreate: (data: Partial<PostData>) => void;
  data: PostData;
  format: Format;
  page?: boolean;
}

function PostForm({
  onCreate,
  data,
  format,
  page = false,
}: PostFormProps) {
  const navigate = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<'draft' | 'publish' | 'ready' | 'future'>(data.status || "draft");
  const dispatch = useAppDispatch();
  const [valueChange, setValueChange] = useState<boolean>(false);
  const [shouldBlockNavigation, setShouldBlockNavigation] =
    useState<boolean>(false);

  // Initialize publishedDate from data if available
  const [publishedDate, setPublishedDate] = useState<Date | undefined>(
    data.published_date ? new Date(data.published_date) : undefined
  );
  const [activePanel, setActivePanel] = useState<string | null>(null);

  // Initialize form with serialized dates
  const formData = { ...data };

  // Don't store dayjs objects in the form
  if (
    formData.published_date &&
    typeof formData.published_date === "object" &&
    // @ts-expect-error -- todo: fix this type error
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

  const onSave = (values: PostData, statusOverride?: 'draft' | 'publish' | 'ready' | 'future') => {
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
    // @ts-expect-error -- todo: fix this type error
    finalData.author_ids = finalData.authors;
    finalData.status = finalStatus;


    if (finalStatus === "publish") {
      finalData.published_date = publishedDate
        ? dayjs(publishedDate).format("YYYY-MM-DDTHH:mm:ssZ")
        : getCurrentDate();
    } else if (finalStatus === "future") {
      finalData.published_date = publishedDate
        ? dayjs(publishedDate).format("YYYY-MM-DDTHH:mm:ssZ")
        : undefined;
    } else {
      finalData.published_date = undefined;
    }

    try {
      onCreate(finalData);
      // Close panel if open
      setActivePanel(null);
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
          if (page) {
            navigate("/pages")
            return
          }
          navigate("/posts");
        }
      );
    }
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
        className={`transition-all duration-300 ${activePanel ? "blur-sm pointer-events-none" : ""
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
              <div className="flex justify-end mb-4">
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

                  <DropdownMenu>
                    <div className="flex">
                      <Button
                        className="rounded-r-none"
                        disabled={!valueChange}
                        onClick={(e) => {
                          e.preventDefault();
                          const newStatus = "publish";
                          setStatus(newStatus);
                          form.handleSubmit((values) =>
                            onSave(values, newStatus)
                          )();
                        }}
                      >
                        <span className="w-24 text-center">
                          {data.id && status === "publish"
                            ? "Update"
                            : "Publish"}
                        </span>
                      </Button>

                      <DropdownMenuTrigger asChild>
                        <Button className="rounded-l-none border-l px-2">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </div>

                    <DropdownMenuContent>
                      <DropdownMenuItem
                        disabled={!valueChange}
                        onClick={() => {
                          const newStatus = "draft";
                          setStatus(newStatus);
                          form.handleSubmit((values) =>
                            onSave(values, newStatus)
                          )();
                        }}
                      >
                        Save Draft
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

                  {/* Settings button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      setActivePanel("main");
                    }}
                    type="button"
                  >
                    <PanelRightDashed className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1">
                <div className="mx-auto w-full lg:w-2/3 xl:w-1/2">
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
                            placeholder={`Add title for the ${page ? "page" : "post"
                              }`}
                            onChange={(e) => {
                              field.onChange(e);
                              onTitleChange(e.target.value);
                            }}
                            className="text-4xl font-bold text-center resize-none border-none"
                            style={{ minHeight: "80px" }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Status badge */}
                  <div className="flex justify-center mt-4">
                    {renderStatusBadge(status)}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* Side Panel Component */}
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
          onClose={() => setActivePanel(null)}
        />
      )}
    </>
  );
}

export default PostForm;
