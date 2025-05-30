import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import Selector from "../../../components/Selector";
import { FiltersPopoverProps } from "../types";

const FiltersPopover = ({
  form,
  onSave,
  hasActiveFilters,
  isOpen,
  setIsOpen,
}: FiltersPopoverProps) => {
  return (
    <Form {...form}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            className="flex items-center gap-2 bg-[#F0F5FF] text-[#0D1D2D] font-normal"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Filters</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="claimant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Claimants</FormLabel>
                    <Selector
                      mode="multiple"
                      action="Claimants"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ratings</FormLabel>
                    <Selector
                      mode="multiple"
                      action="Ratings"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="button" onClick={form.handleSubmit(onSave)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </Form>
  );
};

export default FiltersPopover;
