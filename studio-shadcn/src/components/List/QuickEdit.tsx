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
  published_date?: string;
  categories?: number[];
  tags?: number[];
  authors?: number[] | Array<{ id: number; display_name: string }>;
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

  const formData = {
    ...data,
    categories: data?.categories || [],
    tags: data?.tags || [],
    authors: data?.authors || [],
    claims: data?.claims || [],
    published_date: data?.published_date
      ? new Date(data.published_date)
      : undefined,
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

    if (values.status === "publish") {
      values.published_date = values.published_date
        ? dayjs(values.published_date).format("YYYY-MM-DDTHH:mm:ssZ")
        : dayjs(Date.now()).format("YYYY-MM-DDTHH:mm:ssZ");
    } else {
      values.published_date = null;
    }

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

  // Format the created date for display in the input field
  const formattedCreatedDate = createdAt
    ? dayjs(createdAt).format("YYYY-MM-DD")
    : "N/A";

  // If form is not properly initialized, show a loading state
  if (!form.formState) {
    return <div>Loading form...</div>;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onChange={() => setValueChange(true)}
        className="space-y-6 mt-4 hover:bg-white"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-2">
              <FormLabel>Title</FormLabel>
              <FormControl>
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
            <FormItem className="flex flex-col space-y-2">
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-2">
                <FormLabel>Status</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
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
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="published_date"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-2">
                <FormLabel>Published Date</FormLabel>
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
                  <PopoverContent className="p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />

          <FormItem className="flex flex-col space-y-2">
            <FormLabel>Created Date</FormLabel>
            <Input
              value={formattedCreatedDate}
              readOnly
              className="cursor-not-allowed"
            />
          </FormItem>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {slug === "fact-check" ? (
            <FormField
              control={form.control}
              name="claims"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-2">
                  <FormLabel>Claims</FormLabel>
                  <FormControl>
                    <Selector
                      isQuickEdit
                      mode="multiple"
                      display="claim"
                      action="Claims"
                      value={field.value || []}
                      onChange={field.onChange}
                      style={{ width: "100%" }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          ) : null}
          <FormField
            control={form.control}
            name="categories"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-2">
                <FormLabel>Categories</FormLabel>
                <FormControl>
                  <Selector
                    isQuickEdit
                    mode="multiple"
                    action="Categories"
                    createEntity="Category"
                    value={field.value || []}
                    onChange={field.onChange}
                    style={{ width: "100%" }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-2">
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Selector
                    isQuickEdit
                    mode="multiple"
                    action="Tags"
                    createEntity="Tag"
                    value={field.value || []}
                    onChange={field.onChange}
                    style={{ width: "100%" }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="authors"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-2">
                <FormLabel>Authors</FormLabel>
                <FormControl>
                  <Selector
                    isQuickEdit
                    mode="multiple"
                    display="display_name"
                    action="Authors"
                    value={field.value || []}
                    onChange={field.onChange}
                    style={{ width: "100%" }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4 mt-6">
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
            Update Changes
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QuickEdit;
