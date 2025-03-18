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
    // Validate form fields before proceeding
    if (!form.formState.isValid) {
      return;
    }

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
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-semibold">Create rating</h1>
        <p className="text-gray-600 mt-2">
          Set up a category to help organize by utilizing the advanced options
          provided below.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          onChange={() => setValueChange(true)}
        >
          <Accordion
            type="single"
            collapsible
            defaultValue="general"
            className="w-full"
          >
            <AccordionItem value="general">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1">
                    <span>General</span>
                  </div>
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
                <div className="space-y-4 pt-4">
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
                          <span>{backgroundColour?.hex || "#FFFFFF"}</span>
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
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <MetaForm />

          <div className="flex justify-start space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!valueChange}>
              {data?.id ? "Update" : "Create Entity"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RatingForm;
