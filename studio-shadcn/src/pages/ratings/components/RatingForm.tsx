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
import { useIsMobile } from "@/hooks/use-mobile";

interface RatingFormProps {
  onCreate: (values: Rating) => void;
  data?: Partial<Rating>;
}

const RatingForm: React.FC<RatingFormProps> = ({ onCreate, data = {} }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
    navigate(-1);
  };

  return (
    <div className={isMobile ? "" : "px-60 max-w-6xl mx-auto"}>
      {/* Mobile header */}
      {isMobile && (
        <div className="mb-4">
          <h1 className="text-xl font-semibold">
            {data && data.id ? "Edit Rating" : "Create Rating"}
          </h1>
          <div className="mt-2">
            <p className="text-gray-600 text-[13px]">
              Set up a rating to help organize by utilizing the advanced options
              provided below.
            </p>
          </div>
        </div>
      )}

      {/* Desktop header */}
      {!isMobile && (
        <div className="mb-6 px-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {data && data.id ? "Edit Rating" : "Create Rating"}
          </h1>
          <div className="mt-2">
            <p className="text-gray-600 text-[13px]">
              Set up a rating to help organize by utilizing the advanced options
              provided below.
            </p>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 mb-4"></div>

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setValueChange(true);
            setTimeout(() => {
              form.handleSubmit(onSubmit)(e);
            }, 0);
          }}
          className="w-full mx-auto"
          onChange={() => setValueChange(true)}
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
                  <div className="py-3 bg-white">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Title</FormLabel>
                              <TitleInput
                                {...field}
                                placeholder="Rating name"
                                onChange={(e) => {
                                  field.onChange(e);
                                  onTitleChange(e.target.value);
                                }}
                              />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="numeric_value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">
                                Numeric Value
                              </FormLabel>
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

                      <div className="mb-4 sm:mb-6">
                        <SlugInput form={form} />
                      </div>

                      {/* Background Color and Text Color row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <FormField
                          control={form.control}
                          name="background_colour"
                          render={() => (
                            <FormItem>
                              <FormLabel className="text-base">
                                Background color
                              </FormLabel>
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
                                        Select a color
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
                                      color={backgroundColour?.hex}
                                      onChange={setBackgroundColour}
                                      disableAlpha
                                    />
                                  </div>
                                ) : null}
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="text_colour"
                          render={() => (
                            <FormItem>
                              <FormLabel className="text-base">
                                Text color
                              </FormLabel>
                              <div className="relative w-full">
                                <div
                                  className="border border-input rounded-md h-9 w-full flex items-center px-3 bg-white shadow-xs cursor-pointer"
                                  onClick={handleTextClick}
                                >
                                  <div className="flex w-full items-center">
                                    {textColour?.hex ? (
                                      <div className="flex items-center gap-2 w-full">
                                        <div
                                          className="w-5 h-5 rounded-sm"
                                          style={{
                                            background: `${textColour?.hex}`,
                                          }}
                                        />
                                        <span className="text-sm">
                                          {textColour.hex}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground text-sm">
                                        Select a color
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {displayTextColorPicker ? (
                                  <div
                                    className={`absolute z-10 ${
                                      isMobile ? "right-0" : "top-10 left-0"
                                    }`}
                                  >
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
                                ) : null}
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Featured Image */}
                      <FormField
                        control={form.control}
                        name="medium_id"
                        render={({ field }) => (
                          <FormItem className="mt-6">
                            <FormLabel className="text-base mb-2">
                              Cover image
                            </FormLabel>
                            <div className="flex justify-center items-start mt-4">
                              <MediaSelector
                                value={field.value}
                                onChange={(value) => {
                                  field.onChange(value);
                                  setValueChange(true);
                                }}
                                containerStyles={{
                                  justifyContent: "center",
                                  width: isMobile ? "84%" : "100%",
                                  height: isMobile ? "160px" : "220px",
                                }}
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
                  : "Create rating"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RatingForm;
