import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Copy } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addSpaceToken } from "../../../actions/tokens";
import { toast } from "sonner";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { Helmet } from "react-helmet";
import { TokenFormValues } from "../types";

// Define the form schema using Zod
const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be minimum 3 characters." })
    .max(50, { message: "Name must be maximum 50 characters." }),
  description: z.string().min(1, { message: "Description is required." }),
});

const CreateToken: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Initialize form
  const form = useForm<TokenFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (values: TokenFormValues) => {
    dispatch(addSpaceToken(values, setToken, setShowModal));
    form.reset();
  };

  const handleCopyToClipboard = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      toast.success("Token copied to clipboard", {
        description: "Your token has been copied to the clipboard.",
      });
    }
  };

  const handleDialogClose = () => {
    navigate("/settings/advanced/tokens");
  };

  return (
    <div className="flex flex-col gap-5">
      <Helmet title={"Create API Token"} />
      <Card className="w-1/2 mx-auto">
        <CardHeader>
          <CardTitle>Create Space Token</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-center">
                <Button type="submit">Generate Token</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          style={{ width: "480px", maxWidth: "90vw" }}
          className="p-4"
        >
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base">Generated Token</DialogTitle>
            <DialogDescription className="text-sm">
              Copy this token to use with your API calls.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between p-3 bg-gray-100 rounded-md mt-2">
            <div className="overflow-x-auto w-full pr-2">
              <code className="text-sm break-all">{token}</code>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyToClipboard}
              className="flex-shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button size="sm" onClick={handleDialogClose}>
              Go to Tokens
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateToken;
