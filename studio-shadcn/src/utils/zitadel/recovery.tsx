import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import AuthLayout from "./AuthLayout";
import { resetPassword } from "../../actions/forgotPassword";
import { RecoveryFormValues } from "./types";
import degaImage from "../../assets/dega-1.png";

// Form validation schema
const formSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const RecoveryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Get params from URL
  const userId = searchParams.get("userID");
  const verificationCode = searchParams.get("code");
  const orgId = searchParams.get("orgID");

  const form = useForm<RecoveryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (values: RecoveryFormValues) => {
    setIsLoading(true);
    setError("");

    try {
      await resetPassword(userId!, values.password, verificationCode!);
      navigate("/auth/login", {
        state: {
          message:
            "Password reset successful. Please login with your new password.",
        },
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to reset password. Please try again."
      );
      setIsLoading(false);
    }
  };

  if (!userId || !verificationCode) {
    return (
      <AuthLayout title="Invalid Recovery Link" logoSrc={degaImage}>
        <div className="flex flex-col items-center gap-4 w-full">
          <Alert variant="destructive">
            <AlertDescription>
              This password reset link is invalid or has expired.
            </AlertDescription>
          </Alert>
          <Button
            variant="default"
            size="lg"
            onClick={() => navigate("/auth/login")}
            className="w-full"
          >
            Return to Login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Your Password" error={error} logoSrc={degaImage}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create New Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default RecoveryPage;
