import React, { useEffect, useState, useRef } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useFormContext } from "react-hook-form";

interface FieldData {
  name: number;
  fieldKey: number;
  key: number;
}

interface MenuFieldProps {
  field: FieldData;
  formFieldPath?: string; // Add form field path for react-hook-form integration
}

const MenuField: React.FC<MenuFieldProps> = ({ field, formFieldPath }) => {
  const { register, watch } = useFormContext();
  const [panelHeader, setPanelHeader] = useState<string>("Menu");
  const [isOpen, setIsOpen] = useState<boolean>(true);
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

  // Watch for changes to name field
  const nameValue = watch(nameFieldPath);

  // Update panel header when name changes
  useEffect(() => {
    if (nameValue) {
      setPanelHeader(nameValue);
    }
  }, [nameValue]);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="min-w-56 max-w-96 bg-slate-100 rounded-md overflow-hidden"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between p-4 font-medium">
        <span>{panelHeader || "Menu"}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </CollapsibleTrigger>

      <CollapsibleContent className="p-4 pt-0 space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${nameFieldPath}`} className="text-sm font-medium">
            Navigation Label <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`${nameFieldPath}`}
            ref={nameInputRef}
            placeholder="Enter Label"
            {...register(nameFieldPath, { required: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${titleFieldPath}`} className="text-sm font-medium">
            Title Attribute
          </Label>
          <Input
            id={`${titleFieldPath}`}
            placeholder="Enter Title"
            {...register(titleFieldPath)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${urlFieldPath}`} className="text-sm font-medium">
            URL
          </Label>
          <Input
            id={`${urlFieldPath}`}
            placeholder="Enter URL"
            {...register(urlFieldPath)}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default MenuField;
