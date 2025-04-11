import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface PasswordInputProps {
  id: string;
  name: string;
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative mt-1">
        <Input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`pr-10 ${error ? "border-red-500" : ""}`}
        />
        <Button
          type="button"
          variant="ghost"
          onClick={togglePasswordVisibility}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
        >
          {showPassword ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </Button>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default PasswordInput;
