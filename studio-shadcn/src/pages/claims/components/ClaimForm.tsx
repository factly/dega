import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useForm, useFieldArray } from "react-hook-form";
import Selector from "../../../components/Selector/index";
import { maker } from "../../../utils/sluger";
import getJsonValue from "../../../utils/getJsonValue";
import { MetaForm, SlugInput } from "../../../components/FormItems";
import { useNavigate } from "react-router-dom";
import SourcesSection from "./SourcesSection";
import {
  ClaimFormValues,
  FormattedClaimValues,
  ClaimFormProps,
} from "../types";

const ClaimForm: React.FC<ClaimFormProps> = ({ onCreate, data = {} }) => {
  const [valueChange, setValueChange] = useState<boolean>(false);
  const [activeKeys, setActiveKeys] = useState<string[]>([
    "general",
    "sources",
  ]);
  const navigate = useNavigate();

  // Initialize form with data
  const initialData = { ...data };
  if (initialData.meta_fields && typeof initialData.meta_fields !== "string") {
    initialData.meta_fields = JSON.stringify(initialData.meta_fields);
  }

  const handleCancel = () => {
    navigate(-1);
  };

  const form = useForm<ClaimFormValues>({
    defaultValues: initialData,
  });

  const claimSourcesArray = useFieldArray({
    control: form.control,
    name: "claim_sources",
  });

  const reviewSourcesArray = useFieldArray({
    control: form.control,
    name: "review_sources",
  });

  const onReset = () => {
    form.reset();
  };

  const disabledDate = (date: Date) => {
    return date > new Date();
  };

  const onSave = (values: ClaimFormValues) => {
    const { claim_date, checked_date, ...rest } = values;
    const formattedValues: FormattedClaimValues = {
      ...rest,
      claimant_id: values.claimant || 0,
      rating_id: values.rating || 0,
    };

    if (claim_date) {
      const date = new Date(claim_date);
      formattedValues.claim_date = date.toISOString();
    }

    if (checked_date) {
      const date = new Date(checked_date);
      formattedValues.checked_date = date.toISOString();
    }

    onCreate(formattedValues);
  };

  const onClaimChange = (value: string) => {
    if (value.length > 150) {
      form.setValue("slug", maker(value.substring(0, 150)));
    } else {
      form.setValue("slug", maker(value));
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="max-w-3xl w-full px-4">
        <div className="text-start mb-4">
          <h1 className="text-xl font-semibold mb-2">
            {data && data.id ? "Edit Claim" : "Create Claim"}
          </h1>
          <p className="text-[#666] text-[13px]">
            Set up a claim to help organize by utilizing the advanced options
            provided below.
          </p>
        </div>

        <Form {...form}>
          <form
            className="space-y-4 border-t pt-4"
            onSubmit={form.handleSubmit((values) => {
              const formValues = { ...values };
              if (formValues.meta_fields) {
                formValues.meta_fields = getJsonValue(formValues.meta_fields);
              }
              onSave(formValues);
              onReset();
            })}
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
                      name="claim"
                      rules={{
                        required: "Please input the Claim!",
                        maxLength: {
                          value: 5000,
                          message: "Claim must be maximum 5000 characters.",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                            Claim
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              rows={6}
                              placeholder="Enter claim..."
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                onClaimChange(e.target.value);
                                setValueChange(true);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <SlugInput form={form} required={true} />

                    <FormField
                      control={form.control}
                      name="fact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fact</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={6}
                              placeholder="Enter Fact..."
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setValueChange(true);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="claimant"
                      rules={{ required: "Please add claimant!" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                            Claimant
                          </FormLabel>
                          <FormControl>
                            <Selector
                              action="Claimants"
                              createEntity="Claimant"
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                                setValueChange(true);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rating"
                      rules={{ required: "Please add rating!" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                            Rating
                          </FormLabel>
                          <FormControl>
                            <Selector
                              action="Ratings"
                              createEntity="Rating"
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                                setValueChange(true);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4 w-full">
                      <FormField
                        control={form.control}
                        name="claim_date"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Claim Date</FormLabel>
                            <FormControl>
                              <DatePicker
                                date={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setValueChange(true);
                                }}
                                disabled={(date) => disabledDate(date)}
                                className="w-full"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="checked_date"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Checked Date</FormLabel>
                            <FormControl>
                              <DatePicker
                                date={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setValueChange(true);
                                }}
                                disabled={(date) => disabledDate(date)}
                                className="w-full"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="sources"
                className="rounded-md overflow-hidden mb-4"
              >
                <AccordionTrigger className="hover:no-underline px-4 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base font-medium">Sources</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-4 pb-4">
                  {/* SourcesSection component */}
                  <SourcesSection
                    claimSourcesArray={claimSourcesArray}
                    reviewSourcesArray={reviewSourcesArray}
                    form={form}
                    setValueChange={setValueChange}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <MetaForm onChange={() => setValueChange(true)} />

            <div className="flex justify-start space-x-4 pt-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button disabled={!valueChange} type="submit">
                {data && data.id ? "Update" : "Create Claim"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ClaimForm;
