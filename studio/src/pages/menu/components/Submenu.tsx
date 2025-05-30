import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { MinusCircle, PlusCircle } from "lucide-react";
import MenuField from "./MenuField";
import { SubmenuProps } from "../types";

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
    <div className="space-y-3 md:space-y-4">
      {!hasReachedMaxDepth && (
        <div className="mt-2 md:mt-4 mb-3 md:mb-6">
          <Button
            type="button"
            onClick={() => append({ name: "", title: "", url: "" })}
            variant="outline"
            className="w-full py-3 md:py-6 text-xs md:text-sm border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center"
          >
            <PlusCircle className="h-4 w-4 mr-1 md:mr-2" />
            Add Submenu
          </Button>
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="space-y-2">
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <div className="w-full">
              <MenuField
                field={{
                  name: index,
                  fieldKey: index,
                  key: index,
                }}
                formFieldPath={`${fieldKey}.menu.${index}`}
              />
              <div className="p-2 md:p-4">
                <Button
                  variant="outline"
                  onClick={() => remove(index)}
                  type="button"
                  className="text-red-500 text-xs md:text-sm w-full md:w-auto"
                  size={isMobileScreen ? "sm" : "default"}
                >
                  <MinusCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  Remove Submenu
                </Button>
              </div>
            </div>
          </div>

          {!hasReachedMaxDepth && (
            <div className="ml-3 md:ml-6">
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
