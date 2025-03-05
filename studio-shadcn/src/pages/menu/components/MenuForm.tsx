import { useEffect, useRef, useState } from "react";
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
import { Plus, MinusCircle } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import MenuField from "./MenuField";
import Submenu from "./Submenu";
import MonacoEditor from "../../../components/MonacoEditor";
import getJsonValue from "../../../utils/getJsonValue";

// Define TypeScript interfaces
interface MenuItem {
  name?: string;
  title?: string;
  url?: string;
  menu?: MenuItem[];
}

interface MenuData {
  id?: string;
  name?: string;
  menu?: MenuItem[];
  meta_fields?: string | Record<string, any>;
}

interface MenuFormProps {
  onCreate: (values: MenuData) => void;
  data?: MenuData;
}

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

  const [valueChange, setValueChange] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const addMenu = useRef<() => void | null>(null);

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

  // Set addMenu ref to append function
  useEffect(() => {
    if (append) {
      addMenu.current = () => append({ name: "" });
    }
  }, [append]);

  return (
    <div className="bg-background">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onChange={() => setValueChange(true)}
        >
          <div className="flex justify-end mb-4">
            <Button
              type="submit"
              variant="default"
              disabled={!valueChange}
              className={!valueChange ? "opacity-50" : ""}
            >
              {data && data.id ? "Update" : "Save"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
            <div className="md:col-span-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-6 flex items-end">
              <Button
                type="button"
                variant="outline"
                className={isMobileScreen ? "" : "mt-8"}
                onClick={() => {
                  if (addMenu.current) addMenu.current();
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add menu
              </Button>
            </div>
          </div>

          <div className="w-full">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="bg-muted/40 mt-4 w-full p-4 rounded-lg overflow-x-auto md:overflow-visible"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div className="md:w-1/2">
                    <MenuField
                      field={{
                        name: index,
                        fieldKey: index,
                        key: index,
                      }}
                      formFieldPath={`menu.${index}`}
                    />
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => remove(index)}
                    >
                      <MinusCircle className="h-4 w-4 mr-2" /> Remove menu
                    </Button>
                  </div>
                </div>
                <div className="ml-6">
                  <Submenu
                    fieldKey={`menu.${index}`}
                    isMobileScreen={isMobileScreen}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="md:w-2/3">
              <FormField
                control={form.control}
                name="meta_fields"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metafields</FormLabel>
                    <FormControl>
                      <MonacoEditor
                        language="json"
                        width={"100%"}
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default MenuForm;
