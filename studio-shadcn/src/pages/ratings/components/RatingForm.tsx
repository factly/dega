import { useState } from "react";
import { useForm } from "react-hook-form";
import { SketchPicker } from "react-color";
import { maker } from "../../../utils/sluger";
import getJsonValue from "../../../utils/getJsonValue";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MetaForm, SlugInput, TitleInput } from "../../../components/FormItems";
import { Rating, ColorResult } from "../../../types";
import MediaSelector from "../../../components/MediaSelector";

interface RatingFormProps {
  onCreate: (values: Rating) => void;
  data?: Partial<Rating>;
}

const RatingForm: React.FC<RatingFormProps> = ({ onCreate, data = {} }) => {
  const navigate = useNavigate();
  const [backgroundColour, setBackgroundColour] = useState<ColorResult | null>(
    data.background_colour || null
  );
  const [textColour, setTextColour] = useState<ColorResult | null>(
    data.text_colour || null
  );
  const [displayBgColorPicker, setDisplayBgColorPicker] = useState(false);
  const [displayTextColorPicker, setDisplayTextColorPicker] = useState(false);
  const [previewText, setPreviewText] = useState(data.name || "Sample");
  const [valueChange, setValueChange] = useState(false);

  const form = useForm<Rating>({
    defaultValues: {
      name: data.name || "",
      slug: data.slug || "",
      numeric_value: data.numeric_value,
      medium_id: data.medium_id,
      ...data,
      meta_fields:
        typeof data.meta_fields === "string"
          ? data.meta_fields
          : JSON.stringify(data.meta_fields),
    },
    mode: "onChange",
  });

  const handleBgClick = () => {
    setDisplayBgColorPicker((prev) => !prev);
    setValueChange(true);
  };

  const handleTextClick = () => {
    setDisplayTextColorPicker((prev) => !prev);
    setValueChange(true);
  };

  const handleBgClose = () => setDisplayBgColorPicker(false);
  const handleTextClose = () => setDisplayTextColorPicker(false);

  const onTitleChange = (value: string) => {
    form.setValue("name", value);
    form.setValue("slug", maker(value));
    setPreviewText(value || "Sample");
    setValueChange(true);
  };

  const onReset = () => {
    form.reset();
    setBackgroundColour(data.background_colour || null);
    setTextColour(data.text_colour || null);
    setValueChange(false);
  };

  const onSubmit = (values: Rating) => {
    const processedValues = {
      ...values,
      meta_fields: values.meta_fields
        ? getJsonValue(values.meta_fields)
        : undefined,
      text_colour: textColour,
      background_colour: backgroundColour,
    };
    onCreate(processedValues);
    onReset();
  };

  const handleCancel = () => {
    navigate("/ratings");
  };

  return (
    <div className="bg-white flex justify-center">
      <div className="w-full max-w-2xl">
        <div className="mb-3 pb-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold">Create rating</h1>
          <p className="text-gray-600 text-[13px] mt-2">
            Set up a category to help organize by utilizing the advanced options
            provided below.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Force valueChange to true on submit attempt
              setValueChange(true);
              // Use setTimeout to ensure state is updated before form submission
              setTimeout(() => {
                form.handleSubmit(onSubmit)(e);
              }, 0);
            }}
            className="space-y-6"
            onChange={() => setValueChange(true)}
          >
            <Accordion
              type="multiple"
              defaultValue={["general"]}
              className="w-full"
            >
              <AccordionItem
                value="general"
                className="rounded-md overflow-hidden mb-2"
              >
                <AccordionTrigger className="hover:no-underline px-4 py-3 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-lg font-medium">General</span>
                    <div
                      className="text-center w-28 text-sm rounded-lg"
                      style={{
                        color: textColour?.hex,
                        background: backgroundColour?.hex,
                        border: "1px solid #9CA3AF",
                      }}
                    >
                      {previewText}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4 px-4 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-5 space-y-4">
                        <TitleInput
                          form={form}
                          name="name"
                          label="Title"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            onTitleChange(e.target.value)
                          }
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormItem className="w-full">
                            <FormLabel>Background Color</FormLabel>
                            <div className="relative">
                              <div
                                className="px-2 py-[6px] bg-white rounded-md border cursor-pointer inline-flex items-center w-full"
                                onClick={handleBgClick}
                              >
                                <div
                                  className="h-6 w-6 rounded-full mr-3"
                                  style={{ background: backgroundColour?.hex }}
                                />
                                <span>
                                  {backgroundColour?.hex || "#FFFFFF"}
                                </span>
                              </div>
                              {displayBgColorPicker && (
                                <div className="absolute z-10 top-0 left-0">
                                  <div
                                    className="fixed inset-0"
                                    onClick={handleBgClose}
                                  />
                                  <SketchPicker
                                    color={backgroundColour?.hex}
                                    onChange={setBackgroundColour}
                                    disableAlpha
                                  />
                                </div>
                              )}
                            </div>
                          </FormItem>

                          <FormItem className="w-full">
                            <FormLabel>Text Color</FormLabel>
                            <div className="relative">
                              <div
                                className="px-2 py-[6px] bg-white rounded border cursor-pointer inline-flex items-center w-full"
                                onClick={handleTextClick}
                              >
                                <div
                                  className="h-6 w-6 rounded-full mr-3"
                                  style={{ background: textColour?.hex }}
                                />
                                <span>{textColour?.hex || "#000000"}</span>
                              </div>
                              {displayTextColorPicker && (
                                <div className="absolute z-10 top-0 left-0">
                                  <div
                                    className="fixed inset-0"
                                    onClick={handleTextClose}
                                  />
                                  <SketchPicker
                                    color={textColour?.hex}
                                    onChange={setTextColour}
                                    disableAlpha
                                  />
                                </div>
                              )}
                            </div>
                          </FormItem>
                        </div>

                        <SlugInput form={form} />

                        <FormField
                          control={form.control}
                          name="numeric_value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Numeric Value</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  value={
                                    field.value === undefined ||
                                    field.value === null
                                      ? ""
                                      : field.value
                                  }
                                  onChange={(e) => {
                                    const value =
                                      e.target.value === ""
                                        ? undefined
                                        : Number(e.target.value);
                                    field.onChange(value);
                                    setValueChange(true);
                                  }}
                                  onBlur={field.onBlur}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="md:col-span-7">
                        <FormField
                          control={form.control}
                          name="medium_id"
                          render={({ field }) => (
                            <FormItem className="h-full">
                              <FormLabel>Featured Image</FormLabel>
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
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="w-full">
              <MetaForm style={{ background: "#f0f2f5", border: 0 }} />
            </div>

            <div className="flex justify-start space-x-4 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={!valueChange}>
                {data?.id ? "Update" : "Create Rating"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default RatingForm;
