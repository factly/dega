import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { maker } from "../../../utils/sluger";
import getJsonValue from "../../../utils/getJsonValue";
import MediaSelector from "../../../components/MediaSelector";
import { SketchPicker } from "react-color";
import {
  MetaForm,
  SlugInput,
  TitleInput,
  DescriptionInput,
} from "../../../components/FormItems";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface ColorResult {
  hex: string;
  rgb: { r: number; g: number; b: number; a?: number };
  hsl: { h: number; s: number; l: number; a?: number };
}

interface TagFormValues {
  name: string;
  slug: string;
  is_featured: boolean;
  background_colour?: ColorResult | null;
  description_html?: string;
  medium_id?: string;
  meta_fields?: string;
  id?: string;
}

interface TagFormProps {
  onCreate: (values: any) => void;
  data?: Partial<TagFormValues>;
}

const TagForm: React.FC<TagFormProps> = ({ onCreate, data = {} }) => {
  const isMobile = useIsMobile();

  // Process meta_fields if they exist
  const initialData = { ...data };
  if (initialData.meta_fields && typeof initialData.meta_fields !== "string") {
    initialData.meta_fields = JSON.stringify(initialData.meta_fields);
  }

  const form = useForm<TagFormValues>({
    defaultValues: initialData as TagFormValues,
  });

  const [valueChange, setValueChange] = useState<boolean>(false);
  const [backgroundColour, setBackgroundColour] = useState<ColorResult | null>(
    data.background_colour ? (data.background_colour as ColorResult) : null
  );
  const [displayBgColorPicker, setDisplayBgColorPicker] =
    useState<boolean>(false);
  const navigate = useNavigate();

  const handleBgClick = () => {
    setDisplayBgColorPicker((prev) => !prev);
    setValueChange(true);
  };

  const handleBgClose = () => {
    setDisplayBgColorPicker(false);
  };

  const onReset = () => {
    form.reset();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    navigate(-1); // Navigate to the previous page
  };

  const onTitleChange = (value: string) => {
    form.setValue("slug", maker(value));
    setValueChange(true);
  };

  const onSubmit = (values: TagFormValues) => {
    const submitValues = { ...values };

    if (submitValues.meta_fields) {
      submitValues.meta_fields = getJsonValue(submitValues.meta_fields);
    }

    submitValues.background_colour = backgroundColour;
    onCreate(submitValues);
    onReset();
  };

  useEffect(() => {
    const subscription = form.watch(() => setValueChange(true));
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <div className={isMobile ? "px-4" : "px-60 max-w-6xl mx-auto"}>
      {/* Mobile header */}
      {isMobile && (
        <div className="mb-4">
          <h1 className="text-xl font-semibold">
            {data && data.id ? "Edit Tag" : "Create Tag"}
          </h1>
          <div className="mt-2">
            <p className="text-gray-600 text-[13px]">
              Set up a tag to help categorize content by entering the essential
              details provided below
            </p>
          </div>
        </div>
      )}

      {/* Desktop header */}
      {!isMobile && (
        <div className="mb-6 px-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {data && data.id ? "Edit Tag" : "Create Tag"}
          </h1>
          <div className="mt-2">
            <p className="text-gray-600 text-[13px]">
              Set up a tag to help categorize content by entering the essential
              details provided below
            </p>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 mb-4"></div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mx-auto">
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
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="mb-4 sm:mb-6">
                            <FormLabel className="text-base">Title</FormLabel>
                            <TitleInput
                              {...field}
                              placeholder="Tag name"
                              onChange={(e) => {
                                field.onChange(e);
                                onTitleChange(e.target.value);
                              }}
                            />
                          </FormItem>
                        )}
                      />

                      <div className="mb-4 sm:mb-6">
                        <SlugInput form={form} />
                      </div>

                      <FormField
                        control={form.control}
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
                        control={form.control}
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

                      {/* Description Input */}
                      <FormField
                        control={form.control}
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

                      {/* Featured Image */}
                      <FormField
                        control={form.control}
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
            <MetaForm form={form} />
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
                  : "Create tag"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TagForm;
