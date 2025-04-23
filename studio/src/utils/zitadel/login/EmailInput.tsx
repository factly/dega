import React from "react";
import { Link } from "react-router-dom";
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
import { Separator } from "@/components/ui/separator";
import GoogleIcon from "../../../assets/google-icon.svg";

interface EmailInputProps {
  email: string;
  setEmail: (email: string) => void;
  onSubmit: (values: { email: string }) => void;
  handleGoogleSignIn: () => void;
  error:string;
}

const formSchema = z.object({
  email: z.string().email("Please enter a valid email!"),
});

const EmailInput: React.FC<EmailInputProps> = ({
  email,
  setEmail,
  onSubmit,
  handleGoogleSignIn,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email,
    },
  });

  const handleEmailSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleEmailSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base text-[#0D1D1D] font-medium">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    {...field}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      field.onChange(e);
                    }}
                    className="h-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full text-base">
            Continue
          </Button>
        </form>
      </Form>

      <div className="flex items-center">
        <div className="flex-grow">
          <Separator className="bg-gray-200" />
        </div>
        <span className="px-4 text-[#666666] text-base">or</span>
        <div className="flex-grow">
          <Separator className="bg-[#EBEBEB]" />
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full text-base text-[#0D1D2D]"
        onClick={handleGoogleSignIn}
      >
        <img src={GoogleIcon} alt="Google" className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>

      <div className="text-center">
        <span className="text-[#09090B] font-normal">
          Don't have an account?{" "}
          <Link
            to={`/auth/registration${
              localStorage.getItem("authRequestId")
                ? `?authRequest=${localStorage.getItem("authRequestId")}`
                : ""
            }`}
            className="text-primary hover:underline"
          >
            Sign up
          </Link>
        </span>
      </div>
    </div>
  );
};

export default EmailInput;
