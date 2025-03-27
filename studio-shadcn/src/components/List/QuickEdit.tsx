import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// Import other necessary components and utilities
import { maker } from "../../utils/sluger";
import Selector from "../Selector";
import { updatePost } from "../../actions/posts";
import { updatePage } from "../../actions/pages";

// Define type interfaces
interface PostData {
  id: number;
  title: string;
  slug: string;
  status: "publish" | "draft" | "ready";
  published_date: string | null;
  categories?: number[];
  tags?: number[];
  authors?: number[];
  claims?: number[];
  [key: string]: any;
}

interface QuickEditProps {
  data: PostData;
  setID: (id: number) => void;
  slug: string;
  page?: boolean;
  createdAt?: string;
  onQuickEditUpdate?: () => void;
}

const QuickEdit: React.FC<QuickEditProps> = ({
  data,
  setID,
  slug,
  page = false,
  createdAt,
  onQuickEditUpdate = () => {},
}) => {
  const [valueChange, setValueChange] = useState(false);
  const dispatch = useDispatch();

  // Ensure data has all required fields with appropriate defaults
  const formData = {
    id: data?.id || 0,
    title: data?.title || "",
    slug: data?.slug || "",
    status: data?.status || "draft",
    published_date: data?.published_date 
      ? new Date(data.published_date) 
      : undefined,
    categories: data?.categories || [],
    tags: data?.tags || [],
    authors: data?.authors || [],
    claims: data?.claims || [],
    // Include any other fields from data
    ...data
  };

  const form = useForm({
    defaultValues: formData,
  });

  const onTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const status = form.getValues("status");
    if (!status || status !== "publish") {
      form.setValue("slug", maker(e.target.value), { shouldDirty: true });
    }
  };

  const onSubmit = (values: any) => {
    // Ensure these arrays are never undefined
    values.category_ids = values.categories || [];
    values.tag_ids = values.tags || [];
    values.author_ids = values.authors || [];
    values.claim_ids = values.claims || [];

    values.status === "publish"
      ? (values.published_date = values.published_date
          ? dayjs(values.published_date).format("YYYY-MM-DDTHH:mm:ssZ")
          : dayjs(Date.now()).format("YYYY-MM-DDTHH:mm:ssZ"))
      : (values.published_date = null);

    if (page) {
      dispatch(
        updatePage({
          ...data,
          ...values,
        }) as any
      ).then(() => {
        setID(0);
        onQuickEditUpdate();
      });
    } else {
      dispatch(
        updatePost({
          ...data,
          ...values,
        }) as any
      ).then(() => {
        setID(0);
        onQuickEditUpdate();
      });
    }
  };

  // If form is not properly initialized, show a loading state
  if (!form.formState) {
    return <div>Loading form...</div>;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onChange={() => setValueChange(true)}
        className="space-y-4 mt-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="grid grid-cols-12 items-center gap-4">
              <FormLabel className="col-span-3">Title</FormLabel>
              <FormControl className="col-span-9">
                <Textarea
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onTitleChange(e);
                  }}
                  rows={2}
                  placeholder="Add title for the post"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem className="grid grid-cols-12 items-center gap-4">
              <FormLabel className="col-span-3">Slug</FormLabel>
              <FormControl className="col-span-9">
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="grid grid-cols-12 items-center gap-4">
              <FormLabel className="col-span-3">Status</FormLabel>
              <div className="col-span-9">
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="publish">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="ready">Ready to Publish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="published_date"
          render={({ field }) => (
            <FormItem className="grid grid-cols-12 items-center gap-4">
              <FormLabel className="col-span-3">Published Date</FormLabel>
              <div className="col-span-9">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? dayjs(field.value).format("YYYY-MM-DD")
                          : "Pick a date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-12 items-center gap-4">
          <FormLabel className="col-span-3">Created Date</FormLabel>
          <div className="col-span-9">
            <p>{createdAt ? dayjs(createdAt).format("YYYY-MM-DD") : "N/A"}</p>
          </div>
        </div>

        {slug === "fact-check" ? (
          <FormField
            control={form.control}
            name="claims"
            render={({ field }) => (
              <FormItem className="grid grid-cols-12 items-center gap-4">
                <FormLabel className="col-span-3">Claims</FormLabel>
                <div className="col-span-9 w-full">
                  <FormControl>
                    <Selector
                      mode="multiple"
                      display="claim"
                      action="Claims"
                      value={field.value || []}
                      onChange={field.onChange}
                      style={{ width: "100%" }}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
        ) : null}

        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem className="grid grid-cols-12 items-center gap-4">
              <FormLabel className="col-span-3">Categories</FormLabel>
              <div className="col-span-9 w-full">
                <FormControl>
                  <Selector
                    mode="multiple"
                    action="Categories"
                    createEntity="Category"
                    value={field.value || []}
                    onChange={field.onChange}
                    style={{ width: "100%" }}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem className="grid grid-cols-12 items-center gap-4">
              <FormLabel className="col-span-3">Tags</FormLabel>
              <div className="col-span-9 w-full">
                <FormControl>
                  <Selector
                    mode="multiple"
                    action="Tags"
                    createEntity="Tag"
                    value={field.value || []}
                    onChange={field.onChange}
                    style={{ width: "100%" }}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="authors"
          render={({ field }) => (
            <FormItem className="grid grid-cols-12 items-center gap-4">
              <FormLabel className="col-span-3">Authors</FormLabel>
              <div className="col-span-9 w-full">
                <FormControl>
                  <Selector
                    mode="multiple"
                    display="display_name"
                    action="Authors"
                    value={field.value || []}
                    onChange={field.onChange}
                    style={{ width: "100%" }}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-center gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setID(0);
              onQuickEditUpdate();
            }}
            type="button"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!valueChange}>
            Update
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QuickEdit;