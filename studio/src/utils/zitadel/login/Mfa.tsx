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
import type { MfaFormValues } from "../types";

interface MfaProps {
  totpCode: string;
  setTotpCode: (code: string) => void;
  onSubmit: (values: MfaFormValues) => void;
}

const formSchema = z.object({
  totpCode: z.string().min(1, "Please input your MFA code!"),
});

const Mfa: React.FC<MfaProps> = ({ totpCode, setTotpCode, onSubmit }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totpCode: totpCode,
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
          name="totpCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enter MFA Code</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    setTotpCode(e.target.value);
                    field.onChange(e);
                  }}
                  className="h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Verify MFA
        </Button>
      </form>
    </Form>
  );
};

export default Mfa;
