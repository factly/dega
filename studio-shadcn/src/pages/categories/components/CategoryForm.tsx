// components/CategoryForm.tsx
import React, { useState, useEffect } from "react";
import { maker } from "../../../utils/sluger";
import MediaSelector from "../../../components/MediaSelector";
import { SketchPicker } from "react-color";
import Selector from "../../../components/Selector";
import getJsonValue from "../../../utils/getJsonValue";
import {
  MetaForm,
  SlugInput,
  TitleInput,
  DescriptionInput,
} from "../../../components/FormItems";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { CategoryFormProps, CategoryFormValues } from "../types";

interface ColorResult {
  hex: string;
  rgb: { r: number; g: number; b: number; a?: number };
  hsl: { h: number; s: number; l: number; a?: number };
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onCreate, data = {} }) => {
  const isMobile = useIsMobile();
  const [valueChange, setValueChange] = useState<boolean>(false);
  const [activeKeys, setActiveKeys] = useState<string[]>(["general"]);
  const [backgroundColour, setBackgroundColour] = useState<ColorResult | null>(
    data.background_colour ? data.background_colour : null
  );
  const [displayBgColorPicker, setDisplayBgColorPicker] = useState<boolean>(false);
  const navigate = useNavigate();

  // Handle meta_fields conversion
  const initialData = { ...data };
  if (initialData.meta_fields && typeof initialData.meta_fields !== "string") {
    initialData.meta_fields = JSON.stringify(initialData.meta_fields);
  }

  const form = useForm<CategoryFormValues>({
    defaultValues: initialData,
  });

  // Reset the form when data changes (important for edit mode)
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      form.reset(initialData);
      setBackgroundColour(data.background_colour || null);
    }
  }, [data, form]);

  const handleCancel = () => {
    navigate(-1);
  };

  const handleBgClick = () => {
    setDisplayBgColorPicker((prev) => !prev);
    setValueChange(true);
  };

  const handleBgClose = () => {
    setDisplayBgColorPicker(false);
  };

  const onTitleChange = (title: string) => {
    const slug = maker(title);
    form.setValue("slug", slug);

    // Update meta fields if they exist
    if (form.getValues("meta")) {
      form.setValue("meta.canonical_URL", slug);
      form.setValue("meta.facebook.canonical_URL", slug);
      form.setValue("meta.google.canonical_URL", slug);
      form.setValue("meta.twitter.canonical_URL", slug);

      form.setValue("meta.facebook.title", title);
      form.setValue("meta.google.title", title);
      form.setValue("meta.twitter.title", title);
    }

    setValueChange(true);
  };

  const onSubmit = (values: CategoryFormValues) => {
    // Create a new object to avoid modifying the form values directly
    const submissionValues = { ...values };

    // Always preserve the original ID format from the data
    if (data.id !== undefined) {
      submissionValues.id = data.id;
    }

    // Process meta_fields
    if (submissionValues.meta_fields) {
      submissionValues.meta_fields = getJsonValue(
        submissionValues.meta_fields as string
      );
    }

    // Add background color
    submissionValues.background_colour = backgroundColour;

    // Call the onCreate prop function
    onCreate(submissionValues);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="max-w-3xl w-full px-4">
        <div className="text-start mb-4">
          <h1 className="text-xl font-semibold mb-2">
            {data && data.id ? "Edit Category" : "Create Category"}
          </h1>
          <p className="text-[#666] text-[13px]">
            Set up a category to help organize by utilizing the advanced options
            provided below.
          </p>
        </div>

        <Form {...form}>
          <form
            className="space-y-4 border-t pt-4"
            onSubmit={form.handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                e.target instanceof HTMLTextAreaElement === false
              ) {
                e.preventDefault();
              }
            }}
          >
            <Accordion
              type="multiple"
              value={activeKeys}
              onValueChange={setActiveKeys}
              className="w-full"
            >
              <AccordionItem
                value="general"
                className="rounded-md overflow-hidden mb-4"
              >
                <AccordionTrigger className="hover:no-underline px-4 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base font-medium">General</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-4 pb-4">
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      rules={{
                        required: "Please input the Category name!",
                        maxLength: {
                          value: 100,
                          message: "Name must be maximum 100 characters.",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                            Name
                          </FormLabel>
                          <TitleInput
                            {...field}
                            placeholder="Category name"
                            onChange={(e) => {
                              field.onChange(e);
                              onTitleChange(e.target.value);
                            }}
                          />
                        </FormItem>
                      )}
                    />

                    <SlugInput form={form} required={true} />

                    <FormField
                      control={form.control}
                      name="parent_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent Category</FormLabel>
                          <Selector
                            action="Categories"
                            invalidOptions={data?.id ? [String(data.id)] : []}
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                              setValueChange(true);
                            }}
                          />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <FormLabel>Featured</FormLabel>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(value) => {
                              field.onChange(value);
                              setValueChange(true);
                            }}
                          />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="background_colour"
                      render={() => (
                        <FormItem>
                          <FormLabel>Colour</FormLabel>
                          <div className="relative w-full">
                            <div
                              className="border border-input rounded-md h-9 w-full flex items-center px-3 bg-white shadow-xs cursor-pointer"
                              onClick={handleBgClick}
                            >
                              <div className="flex w-full items-center">
                                {backgroundColour?.hex ? (
                                  <div className="flex items-center gap-2 w-full">
                                    <div
                                      className="w-5 h-5 rounded-sm"
                                      style={{
                                        background: `${backgroundColour?.hex}`,
                                      }}
                                    />
                                    <span className="text-sm">
                                      {backgroundColour.hex}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    Select a colour
                                  </span>
                                )}
                              </div>
                            </div>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name="description_html"
                        render={({ field }) => (
                          <div className="mb-4 sm:mb-6">
                            <FormLabel className="text-base block mb-2">
                              Description
                            </FormLabel>
                            <DescriptionInput
                              initialValue={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                                setValueChange(true);
                              }}
                              noLabel={true}
                              rows={5}
                              inputProps={{
                                placeholder: "Enter Description...",
                                style: {
                                  minHeight: "92px",
                                  borderRadius: "0.25rem",
                                  border: "1px solid rgba(0, 0, 0, 0.15)",
                                },
                              }}
                            />
                          </div>
                        )}
                      />

                    <FormField
                      control={form.control}
                      name="medium_id"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Featured Image</FormLabel>
                          <MediaSelector
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                              setValueChange(true);
                            }}
                            containerStyles={{
                              justifyContent: "center",
                              width: "100%",
                              height: isMobile ? "160px" : "220px",
                            }}
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <MetaForm onChange={() => setValueChange(true)} />

            <div className="flex justify-start space-x-4 pt-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button disabled={!valueChange} type="submit">
                {data && data.id ? "Update" : "Create Category"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CategoryForm;
