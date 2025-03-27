import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { maker } from "../../../utils/sluger";
import getJsonValue from "../../../utils/getJsonValue";
import MediaSelector from "../../../components/MediaSelector";
import { SketchPicker } from "react-color";
import { MetaForm, SlugInput, TitleInput } from "../../../components/FormItems";
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
    <div className="px-60 max-w-6xl mx-auto">
      <div className="mb-4 px-4">
        <h1 className="text-xl font-semibold text-gray-900">Create Tag</h1>
        <div className="mt-2">
          <p className="text-gray-600 text-[13px]">
            Set up a tag to help categorize content by entering the essential
            details provided below
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 mb-4"></div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mx-auto">
          <div className="w-full">
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
                  <div className="grid grid-cols-1 md:grid-cols-12 p-6 bg-white">
                    <div className="md:col-span-5 space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="mb-6">
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

                      <div className="mb-6">
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

                      <FormItem className="space-y-2 mt-4">
                        <FormLabel className="text-base">Colour</FormLabel>
                        <div style={{ position: "relative", width: "100%" }}>
                          <div
                            style={{
                              padding: "5px",
                              width: "100%",
                              background: "#fff",
                              display: "inline-block",
                              cursor: "pointer",
                              borderRadius: "4px",
                              boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
                            }}
                            onClick={handleBgClick}
                          >
                            <div
                              style={{
                                width: "100%",
                                height: "24px",
                                borderRadius: "2px",
                                background: `${
                                  backgroundColour && backgroundColour.hex
                                }`,
                              }}
                            />
                          </div>
                          {displayBgColorPicker ? (
                            <div
                              style={{
                                position: "absolute",
                                zIndex: "2",
                                top: 0,
                                left: "120px",
                              }}
                            >
                              <div
                                style={{
                                  position: "fixed",
                                  top: "0px",
                                  right: "0px",
                                  bottom: "0px",
                                  left: "0px",
                                }}
                                onClick={handleBgClose}
                              />
                              <SketchPicker
                                color={
                                  backgroundColour !== null
                                    ? backgroundColour.hex
                                    : undefined
                                }
                                onChange={(color: ColorResult) => {
                                  setBackgroundColour(color);
                                  setValueChange(true);
                                }}
                                disableAlpha
                              />
                            </div>
                          ) : null}
                        </div>
                      </FormItem>
                    </div>

                    <div className="md:col-span-7">
                      <FormField
                        control={form.control}
                        name="medium_id"
                        render={({ field }) => (
                          <FormItem className="h-full">
                            <FormLabel className="text-base mb-2">
                              Featured Image
                            </FormLabel>
                            <div className="flex justify-center items-start h-full mt-4">
                              <MediaSelector
                                value={field.value}
                                onChange={(value) => {
                                  field.onChange(value);
                                  setValueChange(true);
                                }}
                                containerStyles={{ justifyContent: "center" }}
                              />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="w-full mb-8">
            <MetaForm
              style={{ marginBottom: 24, background: "#f0f2f5", border: 0 }}
            />
          </div>

          <div className="flex justify-start mb-8 mt-8">
            <div className="space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="px-6"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!valueChange} className="px-6">
                {data && data.id ? "Update" : "Create tag"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TagForm;
