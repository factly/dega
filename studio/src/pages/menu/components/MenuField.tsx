import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { MenuFieldProps } from "../types";

const MenuField: React.FC<MenuFieldProps> = ({ field, formFieldPath }) => {
  const { control } = useFormContext();
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Create full field paths for each input
  const nameFieldPath = formFieldPath
    ? `${formFieldPath}.name`
    : `menu.${field.name}.name`;
  const titleFieldPath = formFieldPath
    ? `${formFieldPath}.title`
    : `menu.${field.name}.title`;
  const urlFieldPath = formFieldPath
    ? `${formFieldPath}.url`
    : `menu.${field.name}.url`;

  return (
    <div className="bg-white rounded-md overflow-hidden">
      <div className="p-4 space-y-4 md:space-y-6">
        {/* Navigation */}
        <FormField
          control={control}
          name={nameFieldPath}
          rules={{ required: true }}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel className="text-sm md:text-base font-medium">
                Navigation Label <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  ref={nameInputRef}
                  placeholder="Enter Label"
                  className="mt-1 text-sm"
                  value={formField.value}
                  onChange={formField.onChange}
                  onBlur={formField.onBlur}
                  name={formField.name}
                  disabled={formField.disabled}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Title */}
        <FormField
          control={control}
          name={titleFieldPath}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm md:text-base font-medium">
                Title Attribute
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter Title"
                  className="mt-1 text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* URL */}
        <FormField
          control={control}
          name={urlFieldPath}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm md:text-base font-medium">
                URL
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter URL"
                  className="mt-1 text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default MenuField;
