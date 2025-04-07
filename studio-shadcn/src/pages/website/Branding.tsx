import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

import MediaSelector from "../../components/MediaSelector";
import { updateSpace } from "../../actions/spaces";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { Space } from "../../actions/spaces";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "@/hooks/reduxHooks";

interface SocialMediaUrls {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  github?: string;
  youtube?: string;
  linkedin?: string;
  pinterest?: string;
}

interface BrandingFormValues extends Partial<Space> {
  logo_id?: string | null;
  logo_mobile_id?: string | null;
  fav_icon_id?: string | null;
  mobile_icon_id?: string | null;
  social_media_urls?: SocialMediaUrls;
}

interface RootState {
  spaces: {
    selected: string;
    details: {
      [key: string]: Space;
    };
    loading: boolean;
  };
}

function Branding() {
  const dispatch = useAppDispatch();
  const id = useSelector((state: RootState) => state.spaces.selected);
  const [valueChange, setValueChange] = useState<boolean>(false);

  const { space, loading } = useSelector((state: RootState) => {
    return {
      space: state.spaces.details[id],
      loading: state.spaces.loading,
    };
  });

  const form = useForm<BrandingFormValues>({
    defaultValues: space || {},
  });

  // Update form values when space data is available
  useEffect(() => {
    if (space) {
      form.reset(space);
    }
  }, [space, form]);

  const onSubmit = (values: BrandingFormValues) => {
    if (!space) return;

    dispatch(updateSpace({ ...space, ...values }));
    setValueChange(false);
  };

  const handleCancel = () => {
    if (space) {
      form.reset(space);
    }
    setValueChange(false);
  };

  if (loading) return <Skeleton className="h-40 w-full" />;

  if (!space) {
    return <RecordNotFound />;
  }

  return (
    <>
      <Helmet title={"Branding"} />
      <div className="max-w-3xl mx-auto px-4 space-y-4">
        <div className="mb-4 px-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Branding Settings
          </h1>
          <div className="mt-2">
            <p className="text-gray-600 text-[13px]">
              Customize your brand identity by uploading logos, icons, and
              configuring social media accounts
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 mb-4"></div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            onChange={() => setValueChange(true)}
          >
            <Accordion
              type="multiple"
              defaultValue={["icons-logos"]}
              className="w-full"
            >
              <AccordionItem
                value="icons-logos"
                className="rounded-md overflow-hidden mb-2"
              >
                <AccordionTrigger className="hover:no-underline px-4 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base font-medium">
                      Icons and Logos
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 bg-white max-w-3xl mx-auto space-y-4">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="logo_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Primary Logo</FormLabel>
                              <FormDescription>Primary Logo</FormDescription>
                              <FormControl>
                                <MediaSelector
                                  value={field.value}
                                  onChange={field.onChange}
                                  containerStyles={{
                                    justifyContent: "flex-start",
                                    maxWidth: "100%",
                                    margin: "8px 0",
                                  }}
                                  maxWidth={100}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="logo_mobile_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Logo Mobile</FormLabel>
                              <FormDescription>
                                Secondary logo for mobile sites or amp pages
                              </FormDescription>
                              <FormControl>
                                <MediaSelector
                                  value={field.value}
                                  onChange={field.onChange}
                                  containerStyles={{
                                    justifyContent: "flex-start",
                                    maxWidth: "100%",
                                    margin: "8px 0",
                                  }}
                                  maxWidth={100}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="fav_icon_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fav Icon</FormLabel>
                              <FormDescription>
                                Default favicon for browsers and pwa sites
                              </FormDescription>
                              <FormControl>
                                <MediaSelector
                                  value={field.value}
                                  onChange={field.onChange}
                                  containerStyles={{
                                    justifyContent: "flex-start",
                                    maxWidth: "100%",
                                    margin: "8px 0",
                                  }}
                                  maxWidth={100}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="mobile_icon_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mobile Icon</FormLabel>
                              <FormDescription>
                                Favicon for mobile and pwa sites
                              </FormDescription>
                              <FormControl>
                                <MediaSelector
                                  value={field.value}
                                  onChange={field.onChange}
                                  containerStyles={{
                                    justifyContent: "flex-start",
                                    maxWidth: "100%",
                                    margin: "8px 0",
                                  }}
                                  maxWidth={100}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="social-accounts"
                className="rounded-md overflow-hidden mb-2"
              >
                <AccordionTrigger className="hover:no-underline px-4 data-[state=open]:bg-[#F0F5FF] data-[state=closed]:bg-white">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base font-medium">
                      Social Accounts
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                      <FormField
                        control={form.control}
                        name="social_media_urls.facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://www.facebook.com/pages/factly"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="social_media_urls.twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://www.twitter.com/users/factly"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="social_media_urls.instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://www.instagram.com/pages/factly"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="social_media_urls.github"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Github</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://github.com/factly/"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="social_media_urls.youtube"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Youtube</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://www.youtube.com/c/Factlyindia"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="social_media_urls.linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Linkedin</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://www.linkedin.com/company/factlyindia/"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="social_media_urls.pinterest"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pinterest</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://www.pinterest.com/pages/factly"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex justify-start gap-2 mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={!valueChange}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!valueChange}>
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}

export default Branding;
