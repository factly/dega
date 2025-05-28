import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useForm } from "react-hook-form";
import { maker } from "../../../utils/sluger";
import getJsonValue from "../../../utils/getJsonValue";
import MediaSelector from "../../../components/MediaSelector";
import { MetaForm, SlugInput } from "../../../components/FormItems";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { FormatFormProps, FormatFormValues } from "../types";

const FormatForm: React.FC<FormatFormProps> = ({ onCreate, data = {} }) => {
  const navigate = useNavigate();
  const [valueChange, setValueChange] = useState(false);
  const isMobile = useIsMobile();

  // Process meta_fields if it exists
  const initialData = { ...data };
  if (initialData.meta_fields && typeof initialData.meta_fields !== "string") {
    initialData.meta_fields = JSON.stringify(initialData.meta_fields);
  }

  // Initialize the form
  const methods = useForm<FormatFormValues>({
    defaultValues: initialData as Partial<FormatFormValues>,
  });

  // Handle title change to generate slug
  const onTitleChange = (value: string) => {
    methods.setValue("slug", maker(value));
    setValueChange(true);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Handle form submission
  const onSubmit = (values: FormatFormValues) => {
    const submissionValues = { ...values };

    // Always preserve the original ID format from the data
    if (data.id !== undefined) {
      submissionValues.id = data.id;
    }

    if (submissionValues.meta_fields) {
      submissionValues.meta_fields = getJsonValue(
        submissionValues.meta_fields as string
      );
    }

    onCreate(submissionValues);
  };

  return (
    <div className={isMobile ? "px-4" : "px-60 max-w-6xl mx-auto"}>
      {/* Mobile header */}
      {isMobile && (
        <div className="mb-4">
          <h1 className="text-xl font-semibold">
            {data && data.id ? "Edit Format" : "Create Format"}
          </h1>
          <div className="mt-2">
            <p className="text-gray-600 text-[13px]">
              Set up a format by entering the essential details provided below
            </p>
          </div>
        </div>
      )}

      {/* Desktop header */}
      {!isMobile && (
        <div className="mb-6 px-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {data && data.id ? "Edit Format" : "Create Format"}
          </h1>
          <div className="mt-2">
            <p className="text-gray-600 text-[13px]">
              Set up a format by entering the essential details provided below
            </p>
          </div>
        </div>
      )}

      {/* Top border */}
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
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Format name"
                                onChange={(e) => {
                                  field.onChange(e);
                                  onTitleChange(e.target.value);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="mb-4 sm:mb-6">
                        <SlugInput form={methods} />
                      </div>

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
                        name="description"
                        render={({ field }) => (
                          <FormItem className="mb-4 sm:mb-6">
                            <FormLabel className="text-base mb-2">
                              Description
                            </FormLabel>
                            <Textarea
                              {...field}
                              placeholder="Enter description"
                              onChange={(e) => {
                                field.onChange(e);
                                setValueChange(true);
                              }}
                              className="min-h-24"
                            />
                          </FormItem>
                        )}
                      />

                      {/* Featured Image */}
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
                {data && data.id ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FormatForm;
