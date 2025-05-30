import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import MonacoEditor from "../MonacoEditor";

interface MetaFormProps {
  formData?: MetaFormData;
  style?: React.CSSProperties;
  onChange?: () => void;
  form?: any;
}

interface MetaFormData {
  meta?: {
    title?: string;
    description?: string;
    canonical_URL?: string;
  };
  header_code?: string;
  footer_code?: string;
  meta_fields?: string;
}

const MetaForm: React.FC<MetaFormProps> = ({
  formData,
  style,
  form,
  onChange,
}) => {
  const [headerCode, setHeaderCode] = React.useState(
    formData?.header_code || ""
  );
  const [footerCode, setFooterCode] = React.useState(
    formData?.footer_code || ""
  );
  const [metaFields, setMetaFields] = React.useState(
    formData?.meta_fields || ""
  );

  const handleMetaFieldsChange = (value: string | undefined) => {
    if (value !== undefined) {
      setMetaFields(value);
      if (form) {
        form.setValue("meta_fields", value);
      }
      if (onChange) {
        onChange();
      }
    }
  };

  const handleHeaderCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setHeaderCode(value);
      if (form) {
        form.setValue("header_code", value);
      }
      if (onChange) {
        onChange();
      }
    }
  };

  const handleFooterCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setFooterCode(value);
      if (form) {
        form.setValue("footer_code", value);
      }
      if (onChange) {
        onChange();
      }
    }
  };

  const handleTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    fieldName: string
  ) => {
    if (form) {
      form.setValue(fieldName, e.target.value);
    }
    if (onChange) {
      onChange();
    }
  };

  return (
    <div className="w-full" style={style}>
      <Accordion type="multiple" className="w-full">
        <AccordionItem
          value="meta-data"
          className="rounded-md overflow-hidden mb-2"
        >
          <AccordionTrigger className="hover:no-underline px-4 py-3 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white">
            <div className="flex items-center justify-between w-full">
              <span className="text-base font-medium">Meta Data</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 bg-white py-3 px-4">
              {form ? (
                <>
                  <FormField
                    control={form.control}
                    name="meta.title"
                    render={({ field }) => (
                      <FormItem className="mb-4 sm:mb-6">
                        <FormLabel className="text-base">Meta Title</FormLabel>
                        <Input {...field} placeholder="Enter meta title" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meta.description"
                    render={({ field }) => (
                      <FormItem className="mb-4 sm:mb-6">
                        <FormLabel className="text-base">
                          Meta Description
                        </FormLabel>
                        <Textarea
                          {...field}
                          placeholder="Enter meta description"
                          rows={4}
                        />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meta.canonical_URL"
                    render={({ field }) => (
                      <FormItem className="mb-4 sm:mb-6">
                        <FormLabel className="text-base">
                          Canonical URL
                        </FormLabel>
                        <Input {...field} placeholder="Enter canonical URL" />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <>
                  <div className="mb-4 sm:mb-6">
                    <Label htmlFor="meta-title" className="text-base">
                      Meta Title
                    </Label>
                    <Input
                      id="meta-title"
                      defaultValue={formData?.meta?.title}
                      placeholder="Enter meta title"
                      className="mt-2"
                      onChange={() => onChange && onChange()}
                    />
                  </div>
                  <div className="mb-4 sm:mb-6">
                    <Label htmlFor="meta-description" className="text-base">
                      Meta Description
                    </Label>
                    <Textarea
                      id="meta-description"
                      defaultValue={formData?.meta?.description}
                      placeholder="Enter meta description"
                      className="mt-2"
                      rows={4}
                      onChange={() => onChange && onChange()}
                    />
                  </div>
                  <div className="mb-4 sm:mb-6">
                    <Label htmlFor="canonical-url" className="text-base">
                      Canonical URL
                    </Label>
                    <Input
                      id="canonical-url"
                      defaultValue={formData?.meta?.canonical_URL}
                      placeholder="Enter canonical URL"
                      className="mt-2"
                      onChange={() => onChange && onChange()}
                    />
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="code-injection"
          className="rounded-md overflow-hidden mb-2"
        >
          <AccordionTrigger className="hover:no-underline px-4 py-3 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white">
            <div className="flex items-center justify-between w-full">
              <span className="text-base font-medium">Code Injection</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 bg-white py-3 px-4">
              {form ? (
                <>
                  <FormField
                    control={form.control}
                    name="header_code"
                    render={({ field }) => (
                      <FormItem className="mb-4 sm:mb-6">
                        <FormLabel className="text-base">Header Code</FormLabel>
                        <MonacoEditor
                          value={field.value || ""}
                          onChange={(value) => {
                            field.onChange(value);
                            handleHeaderCodeChange(value);
                          }}
                          language="html"
                          title="Header Code"
                        />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="footer_code"
                    render={({ field }) => (
                      <FormItem className="mb-4 sm:mb-6">
                        <FormLabel className="text-base">Footer Code</FormLabel>
                        <MonacoEditor
                          value={field.value || ""}
                          onChange={(value) => {
                            field.onChange(value);
                            handleFooterCodeChange(value);
                          }}
                          language="html"
                          title="Footer Code"
                        />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <>
                  <div className="mb-4 sm:mb-6">
                    <Label htmlFor="header-code" className="text-base">
                      Header Code
                    </Label>
                    <MonacoEditor
                      value={headerCode}
                      onChange={handleHeaderCodeChange}
                      language="html"
                      title="Header Code"
                    />
                  </div>
                  <div className="mb-4 sm:mb-6">
                    <Label htmlFor="footer-code" className="text-base">
                      Footer Code
                    </Label>
                    <MonacoEditor
                      value={footerCode}
                      onChange={handleFooterCodeChange}
                      language="html"
                      title="Footer Code"
                    />
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="meta-fields"
          className="rounded-md overflow-hidden mb-2"
        >
          <AccordionTrigger className="hover:no-underline px-4 py-3 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white">
            <div className="flex items-center justify-between w-full">
              <span className="text-base font-medium">Meta Fields</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="bg-white py-3 px-4">
              {form ? (
                <FormField
                  control={form.control}
                  name="meta_fields"
                  render={({ field }) => (
                    <FormItem className="mb-4 sm:mb-6">
                      <MonacoEditor
                        value={field.value || ""}
                        onChange={(value) => {
                          field.onChange(value);
                          handleMetaFieldsChange(value);
                        }}
                        language="json"
                        title="Meta Fields"
                      />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="mb-4 sm:mb-6">
                  <MonacoEditor
                    value={metaFields}
                    onChange={handleMetaFieldsChange}
                    language="json"
                    title="Meta Fields"
                  />
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default MetaForm;
