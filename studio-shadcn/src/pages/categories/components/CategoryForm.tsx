import React, { useState } from "react";
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

interface ColorResult {
  hex: string;
  rgb: { r: number; g: number; b: number; a?: number };
  hsl: { h: number; s: number; l: number; a?: number };
}

interface CategoryFormData {
  id?: number | string;
  name?: string;
  slug?: string;
  parent_id?: number | string;
  is_featured?: boolean;
  description_html?: string;
  background_colour?: ColorResult | null;
  medium_id?: number | string;
  meta_fields?: string | Record<string, any>;
  meta?: {
    canonical_URL?: string;
    facebook?: {
      title?: string;
      canonical_URL?: string;
    };
    twitter?: {
      title?: string;
      canonical_URL?: string;
    };
    google?: {
      title?: string;
      canonical_URL?: string;
    };
  };
}

interface CategoryFormProps {
  onCreate: (values: CategoryFormData) => void;
  data?: CategoryFormData;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onCreate, data = {} }) => {
  const setLoading = data.id ? false : true;
  const isMobile = useIsMobile();

  // Handle meta_fields conversion
  const initialData = { ...data };
  if (initialData.meta_fields && typeof initialData.meta_fields !== "string") {
    initialData.meta_fields = JSON.stringify(initialData.meta_fields);
  }

  const methods = useForm<CategoryFormData>({
    defaultValues: initialData,
  });

  const [valueChange, setValueChange] = useState(false);
  const [backgroundColour, setBackgroundColour] = useState<ColorResult | null>(
    initialData.background_colour ? initialData.background_colour : null
  );
  const [displayBgColorPicker, setDisplayBgColorPicker] = useState(false);
  const navigate = useNavigate();

  const onReset = () => {
    methods.reset(initialData);
  };

  // Fix: Update the handleCancel function to simply navigate back without triggering form reset
  const handleCancel = () => {
    // Don't call onReset() which might trigger validation/form changes
    // Just navigate away from the page
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
    methods.setValue("slug", slug);

    if (methods.getValues("meta")) {
      methods.setValue("meta.canonical_URL", slug);
      methods.setValue("meta.facebook.canonical_URL", slug);
      methods.setValue("meta.google.canonical_URL", slug);
      methods.setValue("meta.twitter.canonical_URL", slug);

      methods.setValue("meta.facebook.title", title);
      methods.setValue("meta.google.title", title);
      methods.setValue("meta.twitter.title", title);
    }

    setValueChange(true);
  };

  const onSubmit = (values: CategoryFormData) => {
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

    // Handle parent_id - keep as is, don't convert
    // This allows the API to receive the ID in the same format it was provided

    // Handle medium_id - keep as is, don't convert
    // This allows the API to receive the ID in the same format it was provided

    // Call the onCreate prop function and let the parent component handle navigation
    onCreate(submissionValues);
  };

  return (
    <div className={isMobile ? "px-4" : "px-60 max-w-6xl mx-auto"}>
      {/* Mobile header */}
      {isMobile && (
        <div className="mb-4">
          <h1 className="text-xl font-semibold">
            {data && data.id ? "Edit Category" : "Create Category"}
          </h1>
          <div className="mt-2">
            <p className="text-gray-600 text-[13px]">
              Set up a category to help improve by entering the essential
              details provided below
            </p>
          </div>
        </div>
      )}

      {/* Desktop header */}
      {!isMobile && (
        <div className="mb-6 px-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {data && data.id ? "Edit Category" : "Create Category"}
          </h1>
          <div className="mt-2">
            <p className="text-gray-600 text-[13px]">
              Set up a category to help improve by entering the essential
              details provided below
            </p>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 mb-4"></div>

      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="w-full mx-auto"
        >
          <div className="w-full mb-6">
            <Accordion
              type="multiple"
              defaultValue={["general"]}
              className="w-full"
            >
              <AccordionItem
                value="general"
                className="rounded-md overflow-hidden mb-2"
              >
                <AccordionTrigger className="hover:no-underline px-4 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base font-medium">General</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="py-3 bg-white px-4">
                    <div className="space-y-4">
                      <FormField
                        control={methods.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="mb-4 sm:mb-6">
                            <FormLabel className="text-base">Title</FormLabel>
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

                      <div className="mb-4 sm:mb-6">
                        <SlugInput form={methods} />
                      </div>

                      <FormField
                        control={methods.control}
                        name="parent_id"
                        render={({ field }) => (
                          <FormItem className="mb-4 sm:mb-6">
                            <FormLabel className="text-base">
                              Parent Category
                            </FormLabel>
                            <Selector
                              action="Categories"
                              setLoading={setLoading}
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
                        control={methods.control}
                        name="is_featured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between">
                            <FormLabel className="text-base">
                              Featured
                            </FormLabel>
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
                        control={methods.control}
                        name="background_colour"
                        render={() => (
                          <FormItem className="mb-4 sm:mb-6">
                            <FormLabel className="text-base">Colour</FormLabel>
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
                              {displayBgColorPicker ? (
                                <div
                                  className={`absolute z-10 ${
                                    isMobile ? "right-0" : "top-10 left-0"
                                  }`}
                                >
                                  <div
                                    className="fixed inset-0"
                                    onClick={handleBgClose}
                                  />
                                  <SketchPicker
                                    color={
                                      backgroundColour !== null
                                        ? backgroundColour.hex
                                        : undefined
                                    }
                                    onChange={(color) =>
                                      setBackgroundColour(color)
                                    }
                                    disableAlpha
                                  />
                                </div>
                              ) : null}
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
                        control={methods.control}
                        name="medium_id"
                        render={({ field }) => (
                          <FormItem className="mt-6">
                            <FormLabel className="text-base mb-2">
                              Featured Image
                            </FormLabel>
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
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="w-full mb-2">
            <MetaForm form={methods} />
          </div>

          <div
            className={`flex ${
              isMobile ? "justify-between" : "justify-start"
            } mb-8 mt-8`}
          >
            <div
              className={isMobile ? "w-full flex justify-between" : "space-x-4"}
            >
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className={isMobile ? "w-[48%]" : "px-6"}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!valueChange}
                className={isMobile ? "w-[48%]" : "px-6"}
              >
                {data && data.id
                  ? "Update"
                  : isMobile
                  ? "Create"
                  : "Create category"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CategoryForm;
