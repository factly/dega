import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange, SelectRangeEventHandler } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  date,
  onSelect,
  disabled,
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (onSelect) {
      onSelect(selectedDate);
    }
    setOpen(false); // Close the popover when a date is selected
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          {date ? format(date, "PPP") : placeholder}
          <CalendarIcon className="h-4 w-4 ml-73" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={disabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

// Date Range Picker
interface DateRangePickerProps {
  dateRange?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  disabled?: (date: Date) => boolean;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  dateRange,
  onSelect,
  disabled,
  placeholder = "Pick a date range",
  className,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(dateRange);
  const [open, setOpen] = React.useState(false);

  // When date changes, call the onSelect prop
  React.useEffect(() => {
    if (onSelect) {
      onSelect(date);
    }
  }, [date, onSelect]);

  // Create a handler with the correct type
  const handleSelect: SelectRangeEventHandler = (selected) => {
    setDate(selected);

    // If we have a complete range (both from and to dates), close the popover
    if (selected?.from && selected?.to) {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date?.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            placeholder
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          selected={date}
          onSelect={handleSelect}
          disabled={disabled}
          numberOfMonths={2}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

// DatePicker with Presets
interface DatePickerWithPresetsProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  placeholder?: string;
  className?: string;
  presets?: { name: string; date: Date }[];
}

export function DatePickerWithPresets({
  date,
  onSelect,
  disabled,
  placeholder = "Pick a date",
  className,
  presets,
}: DatePickerWithPresetsProps) {
  const [open, setOpen] = React.useState(false);
  const defaultPresets = [
    { name: "Today", date: new Date() },
    { name: "Yesterday", date: new Date(Date.now() - 86400000) },
    {
      name: "A week ago",
      date: new Date(Date.now() - 7 * 86400000),
    },
  ];

  const finalPresets = presets || defaultPresets;

  const handleSelect = (selectedDate: Date | undefined) => {
    if (onSelect) {
      onSelect(selectedDate);
    }
    setOpen(false); // Close the popover when a date is selected
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col gap-2 p-2">
          {finalPresets.map((preset) => (
            <Button
              key={preset.name}
              variant="ghost"
              className="text-left"
              onClick={() => {
                handleSelect(preset.date);
              }}
            >
              {preset.name}
            </Button>
          ))}
        </div>
        <div className="border-t">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            disabled={disabled}
            initialFocus
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

// For use in forms - this matches how it's used in your ClaimForm.tsx
interface FormDatePickerProps {
  date?: Date;
  onSelect: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
}

export function FormDatePicker({
  date,
  onSelect,
  disabled,
}: FormDatePickerProps) {
  return <DatePicker date={date} onSelect={onSelect} disabled={disabled} />;
}

export default DatePicker;
