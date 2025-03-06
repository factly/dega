import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { maker } from "../../../utils/sluger";
import MediaSelector from "../../../components/MediaSelector";
import getJsonValue from "../../../utils/getJsonValue";
import { MetaForm, SlugInput, TitleInput } from "../../../components/FormItems";
import { useForm } from "react-hook-form";

interface ClaimantData {
  id?: number;
  name?: string;
  slug?: string;
  is_featured?: boolean;
  tag_line?: string;
  medium_id?: number;
  description_html?: string;
  meta_fields?: string;
}

interface ClaimantFormProps {
  onCreate: (values: ClaimantData) => void;
  data?: ClaimantData;
}

const ClaimantForm: React.FC<ClaimantFormProps> = ({ onCreate, data = {} }) => {
  // Handle meta_fields conversion
  const initialData = { ...data };
  if (initialData.meta_fields && typeof initialData.meta_fields !== "string") {
    initialData.meta_fields = JSON.stringify(initialData.meta_fields);
  }

  const form = useForm({
    defaultValues: initialData,
  });

  const [valueChange, setValueChange] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const onReset = () => {
    form.reset(initialData);
  };

  const onTitleChange = (string: string) => {
    form.setValue("slug", maker(string));
    setValueChange(true);
  };

  const onSubmit = (values: ClaimantData) => {
    const submissionValues = { ...values };
    if (submissionValues.meta_fields) {
      submissionValues.meta_fields = getJsonValue(submissionValues.meta_fields);
    }
    onCreate(submissionValues);
    onReset();
  };

  return (
    <div className="px-60 max-w-6xl mx-auto">
      {/* Added Heading and Subheading with bottom border */}
      <div className="mb-6 px-4">
        <h1 className="text-xl font-semibold text-gray-900">Create Claimant</h1>
        <div className="mt-2">
          <p className="text-gray-600 text-[13px]">
            Set up a category to help improve by entering the essential details
            provided below
          </p>
        </div>
      </div>

      {/* Added a top border above the form */}
      <div className="border-t border-gray-200 mb-6"></div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mx-auto">
          <div className="mb-6 w-full">
            <Collapsible
              open={isExpanded}
              onOpenChange={setIsExpanded}
              className="w-full bg-[#F0F5FF] rounded-md"
            >
              <div className="flex items-center justify-between px-4 py-2">
                <h3 className="text-base font-medium">General</h3>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
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
                            placeholder="Category title"
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
                          <FormLabel className="text-base">Featured</FormLabel>
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
                      name="tag_line"
                      render={({ field }) => (
                        <FormItem className="mb-6">
                          <FormLabel className="text-base mb-2">
                            Tag Line
                          </FormLabel>
                          <Textarea
                            {...field}
                            placeholder="Enter tag line"
                            onChange={(e) => {
                              field.onChange(e);
                              setValueChange(true);
                            }}
                            className="min-h-24"
                          />
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
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="w-full mb-8">
            <MetaForm
              style={{ marginBottom: 24, background: "#f0f2f5", border: 0 }}
            />
          </div>

          <div className="flex justify-start mb-8 mt-8">
            <div className="space-x-4">
              <Button variant="outline" onClick={onReset} className="px-6">
                Cancel
              </Button>
              <Button type="submit" disabled={!valueChange} className="px-6">
                {data && data.id ? "Update" : "Create claimant"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ClaimantForm;
