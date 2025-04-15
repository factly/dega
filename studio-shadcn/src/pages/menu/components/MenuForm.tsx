import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import MonacoEditor from "../../../components/MonacoEditor";
import getJsonValue from "../../../utils/getJsonValue";
import { useNavigate } from "react-router-dom";
import Submenu from "./Submenu";
import MenuField from "./MenuField";
import { MenuFormProps } from "../types";

// Create a schema for form validation with recursive menu items
const menuItemSchema = z.object({
  name: z.string().min(1, { message: "Navigation label is required" }),
  title: z.string().optional(),
  url: z.string().optional(),
});

// Add recursive definition for nested menu items
type MenuItemSchema = z.infer<typeof menuItemSchema> & {
  menu?: MenuItemSchema[];
};

// Update the schema to include recursive menu items
const menuItemWithChildrenSchema: z.ZodType<MenuItemSchema> =
  menuItemSchema.extend({
    menu: z.lazy(() => z.array(menuItemWithChildrenSchema).optional()),
  });

const formSchema = z.object({
  name: z.string().min(1, { message: "Please input the name!" }),
  menu: z.array(menuItemWithChildrenSchema).optional(),
  meta_fields: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function MenuForm({ onCreate, data = {} }: MenuFormProps) {
  const navigate = useNavigate();

  // Process initial meta_fields
  const initialData = { ...data };
  if (initialData && initialData.meta_fields) {
    if (typeof initialData.meta_fields !== "string") {
      initialData.meta_fields = JSON.stringify(
        initialData.meta_fields,
        null,
        2
      );
    }
  }

  // Initialize menu array with one default item if empty
  if (!initialData.menu || initialData.menu.length === 0) {
    initialData.menu = [{ name: "", title: "", url: "" }];
  }

  const [valueChange, setValueChange] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData as FormValues,
  });

  // Setup field array for menu items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "menu",
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onReset = () => {
    form.reset();
    setValueChange(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    navigate(-1); // Navigate to the previous page
  };

  const onSubmit = (values: FormValues) => {
    const submittedValues = { ...values };

    // Handle meta_fields JSON
    if (submittedValues.meta_fields) {
      try {
        submittedValues.meta_fields = getJsonValue(submittedValues.meta_fields);
      } catch (error) {
        console.error("Invalid meta_fields JSON:", error);
        // Set a form error for meta_fields
        form.setError("meta_fields", {
          type: "manual",
          message: "Invalid JSON format",
        });
        return;
      }
    }

    // Call the onCreate function with the values
    onCreate(submittedValues);
    onReset();
  };

  return (
    <div className="bg-background px-2 md:px-0">
      <div className="mb-4 px-2 md:px-4">
        <h1 className="text-lg md:text-xl font-semibold text-gray-900">
          {data && data.id ? "Edit Menu" : "Create Menu"}
        </h1>
        <div className="mt-1 md:mt-2">
          <p className="text-gray-600 text-xs md:text-sm">
            Set up a menu to help organize by utilizing the advanced options
            provided below.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 mb-4"></div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onChange={() => setValueChange(true)}
          className="px-2 md:px-0"
        >
          <div className="space-y-3 md:space-y-4">
            {/* General Accordion */}
            <Accordion
              type="multiple"
              defaultValue={["general"]}
              className="w-full"
            >
              <AccordionItem
                value="general"
                className="rounded-md overflow-hidden mb-2"
              >
                <AccordionTrigger className="hover:no-underline px-3 md:px-4 py-2 md:py-3 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white text-sm md:text-base">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm md:text-base font-medium">
                      General
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="py-2 md:py-3 bg-white px-3 md:px-4">
                    <div className="space-y-4 md:space-y-6">
                      {/* Name Field */}
                      <div className="w-full md:w-2/3">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm md:text-base font-medium">
                                Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Menu Name"
                                  className="text-sm"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Meta Fields */}
                      <div className="w-full md:w-2/3">
                        <FormField
                          control={form.control}
                          name="meta_fields"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm md:text-base font-medium">
                                Meta Fields
                              </FormLabel>
                              <FormControl>
                                <MonacoEditor
                                  language="json"
                                  width={"100%"}
                                  height={isMobileScreen ? "150px" : "200px"}
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Menu Sections Accordion */}
            <Accordion
              type="multiple"
              defaultValue={["menu-sections"]}
              className="w-full"
            >
              <AccordionItem
                value="menu-sections"
                className="rounded-md overflow-hidden mb-2"
              >
                <AccordionTrigger className="hover:no-underline px-3 md:px-4 py-2 md:py-3 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white text-sm md:text-base">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm md:text-base font-medium">
                      Menu Sections
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="py-2 md:py-3 bg-white px-3 md:px-4">
                    {/* Menu Items */}
                    <div className="space-y-3 md:space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.id} className="space-y-2">
                          <div className="border border-gray-200 rounded-md w-full md:w-2/3">
                            <div>
                              <MenuField
                                field={{
                                  name: index,
                                  fieldKey: index,
                                  key: index,
                                }}
                                formFieldPath={`menu.${index}`}
                              />

                              {/* Submenu Section */}
                              <div className="mt-2 md:mt-4">
                                <FormItem>
                                  <FormLabel className="text-sm md:text-base font-medium ml-3 md:ml-4">
                                    Submenu
                                  </FormLabel>
                                  <div className="px-3 md:px-4">
                                    <Submenu
                                      fieldKey={`menu.${index}`}
                                      isMobileScreen={isMobileScreen}
                                      depth={0}
                                    />
                                  </div>
                                </FormItem>
                              </div>

                              {/* Remove Button */}
                              <div className="p-3 md:p-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => remove(index)}
                                  className="text-red-500 text-xs md:text-sm w-full md:w-auto"
                                  size={isMobileScreen ? "sm" : "default"}
                                >
                                  <MinusCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                  Remove Menu Item
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 md:mt-4 mb-3 md:mb-6 w-full md:w-2/3">
                      <Button
                        type="button"
                        onClick={() => append({ name: "" })}
                        variant="outline"
                        className="w-full py-3 md:py-6 text-xs md:text-sm border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center"
                      >
                        <PlusCircle className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />{" "}
                        Add Menu Item
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Form Actions */}
          <div className="flex justify-start mt-4 md:mt-6 space-x-3 md:space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="px-3 md:px-6 text-xs md:text-sm py-1 md:py-2"
              size={isMobileScreen ? "sm" : "default"}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              disabled={!valueChange}
              className={`text-xs md:text-sm py-1 md:py-2 ${
                !valueChange ? "opacity-50" : ""
              }`}
              size={isMobileScreen ? "sm" : "default"}
            >
              {data && data.id ? "Save Changes" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default MenuForm;
