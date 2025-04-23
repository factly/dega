import React from "react";
import { Button } from "@/components/ui/button";
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
import PasswordInput from "@/components/PasswordInput";

interface PasswordProps {
  password: string;
  setPassword: (password: string) => void;
  onSubmit: (values: { password: string }) => void;
  onForgotPassword: () => void;
}

const formSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const Password: React.FC<PasswordProps> = ({
  password,
  setPassword,
  onSubmit,
  onForgotPassword,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: password,
    },
  });

  const handlePasswordSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  return (
    <div className="w-full space-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handlePasswordSubmit)}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    type="password"
                    placeholder="Enter your password..."
                    {...field}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <Button type="submit" className="w-full">
              Sign In
            </Button>

            <Button
              type="button"
              variant="link"
              className="w-full text-primary hover:underline"
              onClick={onForgotPassword}
            >
              Forgot Password?
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Password;
