import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import Selector from "./Selector";
import { useIsMobile } from "@/hooks/use-mobile";

export interface FiltersPopoverProps<T = any> {
  form: any;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  onSave: (values: T) => void;
  hasActiveFilters?: boolean;
}

const FiltersPopover = <T extends Record<string, any>>({
  form,
  isOpen,
  setIsOpen,
  onSave,
  hasActiveFilters,
}: FiltersPopoverProps<T>) => {
  const isMobile = useIsMobile();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          size={isMobile ? "sm" : "default"}
          className="flex items-center gap-2 bg-[#F0F5FF] text-[#0D1D2D] font-normal"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={isMobile ? "w-[calc(100vw-2rem)] p-3" : "w-80 p-4"}
      >
        <div className="space-y-4">
          <h3 className="font-medium text-sm">Filters</h3>
          <Form {...form}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <Selector
                      mode="multiple"
                      action="Tags"
                      placeholder="Filter Tags"
                      {...field}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <Selector
                      mode="multiple"
                      action="Categories"
                      placeholder="Filter Categories"
                      createEntity="Category"
                      {...field}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authors</FormLabel>
                    <Selector
                      mode="multiple"
                      action="Authors"
                      placeholder="Filter Authors"
                      display="display_name"
                      {...field}
                    />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                className="w-full"
                onClick={() => form.handleSubmit(onSave)()}
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
