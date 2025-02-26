import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save } from "lucide-react";
import MonacoEditor from "../../../components/MonacoEditor";
import getJsonValue from "../../../utils/getJsonValue";
import { SlugInput } from "../../../components/FormItems";
import { RootState } from "../../../types";

export interface Space {
  id: string;
  name: string;
  site_address: string;
  site_title: string;
  tag_line: string;
  description?: string;
  slug?: string;
  organisation_id: string;
  meta_fields?: string | Record<string, any>;
  org_role?: string;
}

export interface Organization {
  id: string;
  title: string;
  role: string;
  spaces: string[];
}

interface SpaceEditFormProps {
  onCreate: (values: Partial<Space>) => void;
  data?: Partial<Space>;
}

const SpaceEditForm: React.FC<SpaceEditFormProps> = ({
  onCreate,
  data = {},
}) => {
  const initialData = { ...data };

  if (initialData && initialData.meta_fields) {
    if (typeof initialData.meta_fields !== "string") {
      initialData.meta_fields = JSON.stringify(initialData.meta_fields);
    }
  }

  const [valueChange, setValueChange] = useState<boolean>(false);
  const orgs: Organization[] = useSelector(
    (state: RootState) => state.spaces.orgs
  );

  // Define form schema
  const formSchema = z.object({
    organisation_id: z.string({ required_error: "Organisation is required" }),
    name: z
      .string()
      .min(3, { message: "Name must be minimum 3 characters." })
      .max(50, { message: "Name must be maximum 50 characters." }),
    slug: z.string().optional(),
    site_title: z.string().optional(),
    tag_line: z.string().optional(),
    site_address: z.string().optional(),
    description: z.string().optional(),
    meta_fields: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData as FormValues,
  });

  const onSubmit = (values: FormValues) => {
    const submitValues = { ...values };
    if (submitValues.meta_fields) {
      submitValues.meta_fields = getJsonValue(submitValues.meta_fields);
    }
    onCreate(submitValues);
  };

  return (
    <div className="py-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onChange={() => setValueChange(true)}
          className="space-y-6"
        >
          <div className="flex justify-end">
            <Button
              disabled={!valueChange}
              type="submit"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Update
            </Button>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <FormLabel className="col-span-3 flex items-center justify-end">
              Name
            </FormLabel>
            <div className="col-span-9 flex gap-4">
              <FormField
                control={form.control}
                name="organisation_id"
                render={({ field }) => (
                  <FormItem className="w-2/5">
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select organisation" />
                        </SelectTrigger>
                        <SelectContent>
                          {orgs.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-3/5">
                    <FormControl>
                      <Input placeholder="Input name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <SlugInput />

          <div className="grid grid-cols-12 gap-4">
            <FormLabel className="col-span-3 flex items-center justify-end">
              Title
            </FormLabel>
            <div className="col-span-9">
              <FormField
                control={form.control}
                name="site_title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <FormLabel className="col-span-3 flex items-center justify-end">
              Tag Line
            </FormLabel>
            <div className="col-span-9">
              <FormField
                control={form.control}
                name="tag_line"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <FormLabel className="col-span-3 flex items-center justify-end">
              Website
            </FormLabel>
            <div className="col-span-9">
              <FormField
                control={form.control}
                name="site_address"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <FormLabel className="col-span-3 flex items-center justify-end">
              Description
            </FormLabel>
            <div className="col-span-9">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea placeholder="Enter Description..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <FormLabel className="col-span-3 flex items-center justify-end">
              Metafields
            </FormLabel>
            <div className="col-span-9">
              <FormField
                control={form.control}
                name="meta_fields"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <MonacoEditor
                        language="json"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SpaceEditForm;
