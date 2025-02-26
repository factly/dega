import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import PasswordInput from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Define the form schema with Zod
const formSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Define types for the form values
type FormValues = z.infer<typeof formSchema>;

// Define the interface for the API payload
interface UserPayload {
  profile: {
    givenName: string;
    familyName: string;
    displayName: string;
  };
  email: {
    email: string;
    isVerified: boolean;
  };
  password: {
    password: string;
    changeRequired: boolean;
  };
  confirmPassword: {
    password: string;
    changeRequired: boolean;
  };
}

const AddUsers: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize the form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: FormValues): Promise<void> => {
    setIsSubmitting(true);
    try {
      const payload: UserPayload = {
        profile: {
          givenName: values.firstName,
          familyName: values.lastName,
          displayName: `${values.firstName} ${values.lastName}`,
        },
        email: {
          email: values.email,
          isVerified: true,
        },
        password: {
          password: values.password,
          changeRequired: false,
        },
        confirmPassword: {
          password: values.confirmPassword,
          changeRequired: false,
        },
      };

      const response = await fetch(
        `${import.meta.env.VITE_ZITADEL_AUTHORITY}/v2/users/human`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      toast.success("User created successfully");
      navigate("/settings/members");
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <Button
        variant="ghost"
        className="mb-6 -ml-3 flex items-center gap-2"
        onClick={() => navigate("/settings/organisations")}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Organisations
      </Button>

      <div className="mx-auto max-w-lg">
        <h2 className="mb-6 text-2xl font-bold">Create New User</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      id="password"
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      required
                    />
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
                    <PasswordInput
                      id="confirmPassword"
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating User..." : "Create User"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddUsers;
