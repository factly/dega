import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";
import { Check, CalendarIcon } from "lucide-react";

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

  const form = useForm({
    defaultValues: {
      ...data,
      published_date: data.published_date
        ? new Date(data.published_date)
        : undefined,
    },
  });

  const onTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (form.getValues("status") !== "publish") {
      form.setValue("slug", maker(e.target.value), { shouldDirty: true });
    }
  };

  const onSubmit = (values: any) => {
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
        })
      ).then(() => {
        setID(0);
        onQuickEditUpdate();
      });
    } else {
      dispatch(
        updatePost({
          ...data,
          ...values,
        })
      ).then(() => {
        setID(0);
        onQuickEditUpdate();
      });
    }
  };

  return (
    <Form
      form={form}
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
            <Select
              value={field.value}
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl className="col-span-9 w-40">
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
          <FormItem className="grid grid-cols-12 items-center gap-4">
            <FormLabel className="col-span-3">Published Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl className="col-span-9 w-40">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
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
              <FormControl className="col-span-9">
                <Selector
                  mode="multiple"
                  display="claim"
                  action="Claims"
                  value={field.value}
                  onChange={field.onChange}
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
          <FormItem className="grid grid-cols-12 items-center gap-4">
            <FormLabel className="col-span-3">Categories</FormLabel>
            <FormControl className="col-span-9">
              <Selector
                mode="multiple"
                action="Categories"
                createEntity="Category"
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem className="grid grid-cols-12 items-center gap-4">
            <FormLabel className="col-span-3">Tags</FormLabel>
            <FormControl className="col-span-9">
              <Selector
                mode="multiple"
                action="Tags"
                createEntity="Tag"
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="authors"
        render={({ field }) => (
          <FormItem className="grid grid-cols-12 items-center gap-4">
            <FormLabel className="col-span-3">Authors</FormLabel>
            <FormControl className="col-span-9">
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

      <div className="flex justify-center gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => {
            setID(0);
            onQuickEditUpdate();
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!valueChange}>
          Update
        </Button>
      </div>
    </Form>
  );
};

export default QuickEdit;
