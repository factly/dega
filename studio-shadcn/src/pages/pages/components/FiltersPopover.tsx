// components/FiltersPopover.tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import Selector from "../../../components/Selector";
import { Filter } from "lucide-react";
import { FiltersPopoverProps } from "../types";

const FiltersPopover = ({ form, onSave }: FiltersPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center bg-[#F0F5FF] border-[#F0F5FF] space-x-1"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <h4 className="font-medium">Filter Pages</h4>
          <Form {...form}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Selector
                        mode="multiple"
                        action="Tags"
                        placeholder="Filter Tags"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <FormControl>
                      <Selector
                        mode="multiple"
                        action="Categories"
                        placeholder="Filter Categories"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authors</FormLabel>
                    <FormControl>
                      <Selector
                        mode="multiple"
                        action="Authors"
                        placeholder="Filter Authors"
                        display="display_name"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                type="button"
                className="w-full"
                onClick={() =>
                  form.handleSubmit((data) => onSave({ ...data }))()
                }
              >
                Apply Filters
              </Button>
            </div>
          </Form>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FiltersPopover;
