import React from "react";
import { Input } from "@/components/ui/input";

interface SlugInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  [key: string]: any;
}

export const SlugInput: React.FC<SlugInputProps> = ({
  onChange,
  value,
  ...rest
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert the input to a valid slug format
    const slugValue = e.target.value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");

    // Call the onChange handler with the sanitized value
    if (onChange) {
      onChange(slugValue);
    }
  };

  return (
    <Input
      value={value || ""}
      onChange={handleChange}
      placeholder="Enter a slug"
      {...rest}
    />
  );
};
