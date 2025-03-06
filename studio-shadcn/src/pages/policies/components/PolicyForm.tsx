import React, { useState } from "react";
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
  factchecks: ["categories", "tags", "media", "claims"],
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
  const form = useForm<PolicyFormData>({
    defaultValues: data,
  });

  const [valueChange, setValueChange] = useState(false);
  const [checkedValues, setCheckedValues] = useState<Record<string, string[]>>(
    {}
  );

  const updateDependencies = (
    newState: Record<string, string[]>,
    entityName: string
  ) => {
    if (dependencies[entityName]) {
      dependencies[entityName].forEach((dependency) => {
        newState[dependency] = Array.from(
          new Set([...(newState[dependency] || []), "get"])
        );
        updateDependencies(newState, dependency);
      });
    }
  };

  const handleCheckboxChange = (
    newCheckedValues: string[],
    entityName: string
  ) => {
    let updatedCheckedValues = [...newCheckedValues];

    if (
      newCheckedValues.includes("create") ||
      newCheckedValues.includes("update") ||
      newCheckedValues.includes("delete") ||
      newCheckedValues.includes("publish")
    ) {
      updatedCheckedValues = Array.from(new Set([...newCheckedValues, "get"]));
    }

    setCheckedValues((prevState) => {
      const newState = {
        ...prevState,
        [entityName]: updatedCheckedValues,
      };

      updateDependencies(newState, entityName);

      return newState;
    });

    setValueChange(true);

    // Update form values
    const currentPermissions = form.getValues("permissions") || {};
    form.setValue(
      "permissions",
      {
        ...currentPermissions,
        [entityName]: updatedCheckedValues,
      },
      { shouldDirty: true }
    );
  };

  const onSubmit = (values: PolicyFormData) => {
    onCreate({
      ...values,
      permissions: Object.keys(values.permissions)
        .filter(
          (key) => values.permissions[key] && values.permissions[key].length > 0
        )
        .map((key) => ({ resource: key, actions: values.permissions[key] })),
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

          <div className="lg:col-span-7 bg-background p-6">
            <h3 className="font-bold">Authorization</h3>
            <Separator className="my-4" />

            <div className="space-y-4">
              {entities.map((entity, index) => (
                <div key={`permissions-${index}`} className="space-y-2">
                  <FormLabel>{entity.label}</FormLabel>
                  <div className="flex flex-wrap gap-4">
                    {entity.options.map((option) => (
                      <div
                        key={`${entity.name}-${option.value}`}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`${entity.name}-${option.value}`}
                          checked={(checkedValues[entity.name] || []).includes(
                            option.value
                          )}
                          onCheckedChange={(checked) => {
                            const currentValues =
                              checkedValues[entity.name] || [];
                            const newValues = checked
                              ? [...currentValues, option.value]
                              : currentValues.filter((v) => v !== option.value);

                            handleCheckboxChange(newValues, entity.name);
                          }}
                        />
                        <label
                          htmlFor={`${entity.name}-${option.value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
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
