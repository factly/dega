import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getMedium, updateMedium, deleteMedium } from "../../actions/media";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import getUserPermission from "../../utils/getUserPermission";
import MonacoEditor from "../../components/MonacoEditor";
import getJsonValue from "../../utils/getJsonValue";
import { TitleInput } from "../../components/FormItems";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormItem, FormField, FormLabel } from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";

// Types
interface Medium {
  id: string;
  name: string;
  alt_text?: string;
  caption?: string;
  description?: string;
  meta_fields?: string | Record<string, any>;
  url?: {
    proxy?: string;
    raw?: string;
  };
}

interface MediumFormValues {
  name: string;
  alt_text?: string;
  caption?: string;
  description?: string;
  meta_fields?: string | Record<string, any>;
}

interface RootState {
  media: {
    details: Record<string, Medium>;
    loading: boolean;
  };
  spaces: any;
}

function EditMedium(): JSX.Element {
  const [valueChange, setValueChange] = useState<boolean>(false);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);

  useEffect(() => {
    function handleResize(): void {
      setIsMobileScreen(window.innerWidth < 768);
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { id } = useParams<{ id: string }>();
  const history = useNavigation();
  const spaces = useSelector((state: RootState) => state.spaces);
  const actions = getUserPermission({
    resource: "media",
    action: "get",
    spaces,
  });
  const disabled = !(actions.includes("admin") || actions.includes("update"));
  const dispatch = useDispatch();

  const { media, loading } = useSelector((state: RootState) => {
    return {
      media: id && state.media.details[id] ? state.media.details[id] : null,
      loading: state.media.loading,
    };
  });

  const form = useForm<MediumFormValues>({
    defaultValues: media || {},
  });

  useEffect(() => {
    if (id) {
      dispatch(getMedium(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (media) {
      // Set form values when media data is loaded
      let metaFields = media.meta_fields;
      if (metaFields && typeof metaFields !== "string") {
        metaFields = JSON.stringify(metaFields);
      }

      form.reset({
        ...media,
        meta_fields: metaFields as string,
      });
    }
  }, [media, form]);

  const updateMedia = (values: MediumFormValues): void => {
    if (!id || !media) return;

    const data = {
      ...media,
      ...values,
    };
    dispatch(updateMedium(data));
  };

  const handleDeleteMedium = (): void => {
    if (!id) return;
    dispatch(deleteMedium(id)).then(() => history("/media"));
    setShowDeleteDialog(false);
  };

  if (loading) return <Skeleton className="w-full h-64" />;

  if (!media) {
    return <RecordNotFound />;
  }

  return (
    <>
      <Helmet title={`${media?.name} - Edit Medium`} />
      <Form {...form}>
        <form
          className="edit-form"
          onSubmit={form.handleSubmit((values) => {
            const formattedValues = { ...values };
            if (formattedValues.meta_fields) {
              formattedValues.meta_fields = getJsonValue(
                formattedValues.meta_fields as string
              );
            }
            updateMedia(formattedValues);
          })}
          onChange={() => {
            setValueChange(true);
          }}
        >
          <div className="flex justify-end mb-6">
            <div className="space-x-2">
              <Button
                variant="destructive"
                type="button"
                disabled={disabled}
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete
              </Button>
              <Button type="submit" disabled={disabled || !valueChange}>
                Submit
              </Button>
            </div>
          </div>

          <div className="px-4">
            <Accordion type="single" defaultValue="general" collapsible>
              <AccordionItem value="general">
                <AccordionTrigger className="bg-slate-100 p-3 rounded-t-md">
                  <h4 className="text-lg font-semibold">General</h4>
                </AccordionTrigger>
                <AccordionContent className="bg-slate-50 p-6 rounded-b-md">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-7">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="mb-4">
                            <TitleInput
                              name="name"
                              label="Name"
                              inputProps={{
                                disabled,
                                ...field,
                              }}
                            />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="alt_text"
                        render={({ field }) => (
                          <FormItem className="mb-4">
                            <FormLabel>Alt Text</FormLabel>
                            <Input
                              disabled={disabled}
                              {...field}
                              value={field.value || ""}
                            />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="caption"
                        render={({ field }) => (
                          <FormItem className="mb-4">
                            <FormLabel>Caption</FormLabel>
                            <Input
                              disabled={disabled}
                              {...field}
                              value={field.value || ""}
                            />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="mb-4">
                            <FormLabel>Description</FormLabel>
                            <Textarea
                              className="min-h-[100px]"
                              disabled={disabled}
                              {...field}
                              value={field.value || ""}
                            />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="meta_fields"
                        render={({ field }) => (
                          <FormItem className="mb-4">
                            <FormLabel>Metafields</FormLabel>
                            <MonacoEditor
                              language="json"
                              width="100%"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="md:col-span-5">
                      <p className="text-base font-medium">Featured Image</p>
                      <img
                        src={
                          media.url?.[
                            window.REACT_APP_ENABLE_IMGPROXY ? "proxy" : "raw"
                          ]
                        }
                        alt={media.name || "media"}
                        className="mt-4 max-h-[250px] rounded-md block mx-auto"
                        style={{
                          width: isMobileScreen ? "100%" : "305px",
                          height: "170px",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </form>
      </Form>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              media item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMedium}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default EditMedium;
