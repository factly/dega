import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus, MinusCircle } from "lucide-react";
import MenuField from "./MenuField";

interface SubmenuProps {
  fieldKey: string;
  isMobileScreen: boolean;
  depth?: number;
}

const Submenu: React.FC<SubmenuProps> = ({
  fieldKey,
  isMobileScreen,
  depth = 0,
}) => {
  const { control } = useFormContext();

  // Use useFieldArray from react-hook-form to manage the dynamic submenu items
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${fieldKey}.menu`,
  });

  // Limit nesting depth to prevent infinite recursion
  const hasReachedMaxDepth = depth >= 2;

  return (
    <div className="space-y-4">
      {!hasReachedMaxDepth && (
        <Button
          size="sm"
          className="mt-2"
          onClick={() => append({ name: "", title: "", url: "" })}
          type="button"
        >
          <Plus className="h-4 w-4" /> Add submenu
        </Button>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="space-y-2">
          <div
            className={`flex ${
              isMobileScreen ? "flex-col" : "flex-col items-center"
            } gap-4`}
          >
            <div className={isMobileScreen ? "w-full" : "w-1/2"}>
              <MenuField
                field={{
                  name: index,
                  fieldKey: index,
                  key: index,
                }}
                formFieldPath={`${fieldKey}.menu.${index}`}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => remove(index)}
                type="button"
                className="mt-4"
              >
                <MinusCircle className="h-4 w-4" /> Remove menu
              </Button>
            </div>
          </div>

          {!hasReachedMaxDepth && (
            <div className="ml-6">
              <Submenu
                fieldKey={`${fieldKey}.menu.${index}`}
                isMobileScreen={isMobileScreen}
                depth={depth + 1}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Submenu;
