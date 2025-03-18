import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import Selector from "../../../components/Selector";
import { TitleInput } from "../../../components/FormItems";

interface Permission {
  resource: string;
  actions: string[];
}

interface PolicyFormData {
  id?: string;
  name: string;
  users: string[];
  description?: string;
  permissions: Record<string, string[]>;
}

interface PolicyFormProps {
  data?: PolicyFormData;
  onCreate: (values: {
    name: string;
    users: string[];
    description?: string;
    permissions: Permission[];
  }) => void;
}

type OptionType = {
  label: string;
  value: string;
};

type EntityType = {
  name: string;
  label: string;
  options: OptionType[];
};

const options: OptionType[] = [
  { label: "Read", value: "get" },
  { label: "Create", value: "create" },
  { label: "Update", value: "update" },
  { label: "Delete", value: "delete" },
];

const entities: EntityType[] = [
  {
    name: "posts",
    label: "Posts",
    options: [...options, { label: "Publish", value: "publish" }],
  },
  {
    name: "categories",
    label: "Categories",
    options: options,
  },
  {
    name: "tags",
    label: "Tags",
    options: options,
  },
  {
    name: "formats",
    label: "Formats",
    options: options,
  },
  {
    name: "media",
    label: "Media",
    options: options,
  },
  {
    name: "fact-checks",
    label: "Fact Check",
    options: options,
  },
  {
    name: "claims",
    label: "Claims",
    options: options,
  },
  {
    name: "claimants",
    label: "Claimants",
    options: options,
  },
  {
    name: "ratings",
    label: "Ratings",
    options: options,
  },
  {
    name: "menus",
    label: "Menus",
    options: options,
  },
  {
    name: "pages",
    label: "Pages",
    options: options,
  },
  {
    name: "webhooks",
    label: "Webhooks",
    options: options,
  },
];

const dependencies: Record<string, string[]> = {
  posts: ["categories", "tags", "media"],
  categories: ["media"],
  tags: ["media"],
  formats: ["media"],
  "fact-checks": ["categories", "tags", "media", "claims"],
  claims: ["claimants", "ratings"],
  claimants: ["media"],
  ratings: ["media"],
  menus: [],
  pages: ["categories", "tags", "media"],
};

const PolicyForm: React.FC<PolicyFormProps> = ({
  data = { name: "", users: [], permissions: {} },
  onCreate,
}) => {
  const [valueChange, setValueChange] = useState(false);

  // Initialize the form with the defaultValues
  const form = useForm<PolicyFormData>({
    defaultValues: {
      name: data.name || "",
      users: data.users || [],
      description: data.description || "",
      permissions: data.permissions || {},
    },
  });

  // Use a ref to track if we've initialized the form
  const [initialized, setInitialized] = useState(false);

  // Set up the permissions once on initial render
  useEffect(() => {
    if (!initialized && data) {
      setInitialized(true);
    }
  }, [data, initialized]);

  const updateDependencies = (
    newState: Record<string, string[]>,
    entityName: string
  ) => {
    const result = { ...newState };

    if (dependencies[entityName]) {
      dependencies[entityName].forEach((dependency) => {
        result[dependency] = Array.from(
          new Set([...(result[dependency] || []), "get"])
        );
        const nestedDeps = updateDependencies({ ...result }, dependency);
        Object.keys(nestedDeps).forEach((key) => {
          result[key] = nestedDeps[key];
        });
      });
    }

    return result;
  };

  const handleCheckboxChange = (
    checked: boolean | "indeterminate",
    entityName: string,
    optionValue: string
  ) => {
    const currentPermissions = form.getValues("permissions") || {};
    const currentEntityPermissions = currentPermissions[entityName] || [];

    let newEntityPermissions: string[];

    if (checked === true) {
      newEntityPermissions = [...currentEntityPermissions, optionValue];
    } else {
      newEntityPermissions = currentEntityPermissions.filter(
        (v) => v !== optionValue
      );
    }

    if (
      optionValue !== "get" &&
      checked === true &&
      !newEntityPermissions.includes("get")
    ) {
      newEntityPermissions.push("get");
    }

    let updatedPermissions = {
      ...currentPermissions,
      [entityName]: newEntityPermissions,
    };

    if (checked === true) {
      updatedPermissions = updateDependencies(updatedPermissions, entityName);
    }

    // Update the form state
    form.setValue("permissions", updatedPermissions, { shouldDirty: true });
    setValueChange(true);
  };

  const onSubmit = (values: PolicyFormData) => {
    const permissions = Object.keys(values.permissions || {})
      .filter(
        (key) => values.permissions[key] && values.permissions[key].length > 0
      )
      .map((key) => ({ resource: key, actions: values.permissions[key] }));

    onCreate({
      ...values,
      permissions,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div className="flex justify-end">
          <Button disabled={!valueChange} type="submit">
            {data && data.id ? "Update" : "Submit"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <TitleInput {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="users"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Users</FormLabel>
                  <FormControl>
                    <Selector
                      mode="multiple"
                      display="display_name"
                      action="Users"
                      createEntity="User"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="lg:col-span-7 bg-background p-6 border rounded-md">
            <h3 className="font-bold">Authorization</h3>
            <Separator className="my-4" />

            <div className="space-y-4">
              {entities.map((entity, index) => (
                <div key={`permissions-${index}`} className="space-y-2">
                  <FormLabel>{entity.label}</FormLabel>
                  <div className="flex flex-wrap gap-4">
                    {entity.options.map((option) => {
                      const permissions = form.watch("permissions") || {};
                      const isChecked = (
                        permissions[entity.name] || []
                      ).includes(option.value);

                      return (
                        <div
                          key={`${entity.name}-${option.value}`}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`${entity.name}-${option.value}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              handleCheckboxChange(
                                checked,
                                entity.name,
                                option.value
                              );
                            }}
                          />
                          <label
                            htmlFor={`${entity.name}-${option.value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {option.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default PolicyForm;
