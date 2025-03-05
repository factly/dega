import { useState } from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { ChevronDown, ChevronUp } from "lucide-react";

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

function Branding() {
  const dispatch = useAppDispatch();
  const id = useSelector((state: any) => state.spaces.selected);
  const [valueChange, setValueChange] = useState<boolean>(false);
  const [iconsLogosOpen, setIconsLogosOpen] = useState<boolean>(true);
  const [socialAccountsOpen, setSocialAccountsOpen] = useState<boolean>(true);

  const { space, loading } = useSelector((state: any) => {
    return {
      space: state.spaces.details[id],
      loading: state.spaces.loading,
    };
  });

  const form = useForm<BrandingFormValues>({
    defaultValues: space || {},
  });

  const onSubmit = (values: BrandingFormValues) => {
    dispatch(updateSpace({ ...space, ...values }));
    setValueChange(false);
  };

  const handleCancel = () => {
    form.reset(space || {});
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
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            onChange={() => setValueChange(true)}
          >
            <Collapsible
              open={iconsLogosOpen}
              onOpenChange={setIconsLogosOpen}
              className="w-full rounded-md mb-4"
            >
              <div
                className={`flex items-center justify-between px-4 py-2 border-b hover:bg-[#F0F5FF] transition-colors ${
                  iconsLogosOpen ? "bg-[#F0F5FF]" : "bg-white"
                }`}
              >
                <h3 className="text-lg font-medium">Icons and Logos</h3>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {iconsLogosOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                <div className="p-4 bg-white max-w-3xl mx-auto space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <FormField
                      control={form.control}
                      name="logo_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Logo</FormLabel>
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
                          <FormDescription>Primary Logo</FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="logo_mobile_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo Mobile</FormLabel>
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
                          <FormDescription>
                            Secondary logo for mobile sites or amp pages
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fav_icon_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fav Icon</FormLabel>
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
                          <FormDescription>
                            Default favicon for browsers and pwa sites
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mobile_icon_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Icon</FormLabel>
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
                          <FormDescription>
                            Favicon for mobile and pwa sites
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible
              open={socialAccountsOpen}
              onOpenChange={setSocialAccountsOpen}
              className="w-full rounded-md"
            >
              <div
                className={`flex items-center justify-between px-4 py-2 border-b hover:bg-[#F0F5FF] transition-colors ${
                  socialAccountsOpen ? "bg-[#F0F5FF]" : "bg-white"
                }`}
              >
                <h3 className="text-lg font-medium">Social Accounts</h3>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {socialAccountsOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
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
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

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
