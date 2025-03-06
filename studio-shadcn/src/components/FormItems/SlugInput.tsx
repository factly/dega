import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { checker } from "../../utils/sluger";

interface SlugInputProps {
  form: UseFormReturn<any>;
  label?: string;
  required?: boolean;
}

export const SlugInput: React.FC<SlugInputProps> = ({
  form,
  label = "Slug",
  required = true,
}) => {
  return (
    <FormField
      control={form.control}
      name="slug"
      rules={{
        required: required ? "Slug is required" : false,
        pattern: {
          value: checker,
          message: "Please enter a valid slug!",
        },
      }}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base">{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              placeholder="slug-value"
              onChange={(e) => {
                const value = e.target.value
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")
                  .replace(/-+/g, "-");

                field.onChange(value);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SlugInput;
