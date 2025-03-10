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

interface MetaFormProps {
  formData?: MetaFormData;
  style?: React.CSSProperties;
  onChange?: () => void;
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

const MetaForm: React.FC<MetaFormProps> = ({ formData }) => {
  const [headerCode, setHeaderCode] = React.useState(
    formData?.header_code || ""
  );
  const [footerCode, setFooterCode] = React.useState(
    formData?.footer_code || ""
  );
  const [metaFields, setMetaFields] = React.useState(
    formData?.meta_fields || ""
  );

  return (
    <div className="w-full space-y-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="meta-data">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full">
              <span className="text-base">Meta Data</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  defaultValue={formData?.meta?.title}
                  placeholder="Enter meta title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  defaultValue={formData?.meta?.description}
                  placeholder="Enter meta description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="canonical-url">Canonical URL</Label>
                <Input
                  id="canonical-url"
                  defaultValue={formData?.meta?.canonical_URL}
                  placeholder="Enter canonical URL"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="code-injection">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full">
              <span className="text-base">Code Injection</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="header-code">Header Code</Label>
                <Textarea
                  id="header-code"
                  value={headerCode}
                  onChange={(e) => setHeaderCode(e.target.value)}
                  placeholder="Enter header code"
                  className="font-mono"
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="footer-code">Footer Code</Label>
                <Textarea
                  id="footer-code"
                  value={footerCode}
                  onChange={(e) => setFooterCode(e.target.value)}
                  placeholder="Enter footer code"
                  className="font-mono"
                  rows={6}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="meta-fields">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full">
              <span className="text-base">Meta Data Fields</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4">
              <div className="space-y-2">
                <Label htmlFor="meta-fields">Meta Fields (JSON)</Label>
                <Textarea
                  id="meta-fields"
                  value={metaFields}
                  onChange={(e) => setMetaFields(e.target.value)}
                  placeholder="Enter meta fields as JSON"
                  className="font-mono"
                  rows={8}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default MetaForm;
