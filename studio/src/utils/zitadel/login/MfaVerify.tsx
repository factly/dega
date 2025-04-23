import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { MfaVerifyFormValues } from "../types";

interface MfaVerifyProps {
  mfaCode: string;
  setMfaCode: (code: string) => void;
  onSubmit: (values: MfaVerifyFormValues) => void;
}

const formSchema = z.object({
  mfaCode: z.string().min(1, "Please input your MFA code!"),
});

const MfaVerify: React.FC<MfaVerifyProps> = ({
  mfaCode,
  setMfaCode,
  onSubmit,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mfaCode: mfaCode,
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="mfaCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enter MFA Code</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    setMfaCode(e.target.value);
                    field.onChange(e);
                  }}
                  className="h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800">
          Verify MFA
        </Button>
      </form>
    </Form>
  );
};

export default MfaVerify;
