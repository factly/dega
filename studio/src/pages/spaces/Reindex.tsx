import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { reindex, reindexSpace } from "../../actions/meiliReindex";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { RefreshCw } from "lucide-react";
import { useAppDispatch } from "@/hooks/reduxHooks";

// Define interfaces for our data structures
interface Organisation {
  id: number;
  title: string;
  permission: {
    role: string;
  };
  spaces: number[];
}

interface Space {
  id: number;
  name: string;
  organisation_id: number;
}

interface RootState {
  spaces: {
    selected: number;
    details: Record<number, Space>;
    orgs: Organisation[];
    loading: boolean;
  };
}

// Define form schema
const formSchema = z.object({
  organisation_id: z.number().optional(),
  space_id: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const Reindex: React.FC = () => {
  const dispatch = useAppDispatch();
  const [spaceOption, setSpaceOption] = useState<Space[]>([]);
  const [spaceSelected, setSpaceSelected] = useState<boolean>(false);

  // Get data from Redux store
  const { orgId, orgs, spaces } = useSelector((state: RootState) => {
    const { selected, orgs, loading } = state.spaces;
    if (selected > 0) {
      const space = state.spaces.details[selected];
      const orgId = space.organisation_id;
      const org = orgs.find((org) => org.id === orgId);
      const role = org?.permission.role;

      return {
        loading,
        role,
        orgId,
        spaces: state.spaces.details,
        orgs: state.spaces.orgs,
      };
    }
    return { orgId: 0, orgs: [], spaces: [] };
  });

  const [organisationId, setOrganisationId] = useState<number>(orgId);

  // Setup form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organisation_id: orgId || undefined,
      space_id: undefined,
    },
  });

  // Update space options when organisation changes
  useEffect(() => {
    if (orgs.length > 0) {
      const org = orgs.find((org) => org.id === organisationId);
      if (org) {
        const newSpaces = org.spaces.map((spaceId) => spaces[spaceId]);
        setSpaceOption(newSpaces);
      }
    }
  }, [organisationId, orgs, spaces]);

  const handleOrgChange = (value: string) => {
    const numValue = parseInt(value, 10);
    form.setValue("organisation_id", numValue);
    form.setValue("space_id", undefined);
    setOrganisationId(numValue);
    setSpaceSelected(false);
  };

  const handleReindex = () => {
    dispatch(reindex());
  };

  const handleSpaceReindex = () => {
    const spaceId = form.getValues("space_id");
    if (spaceId) {
      dispatch(reindexSpace(spaceId));
    } else {
      form.setError("space_id", {
        type: "manual",
        message: "Please select a space",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form className="max-w-5xl w-full mx-auto">
          <div className="w-full">
            <div className="flex justify-end mb-4">
              <Button
                type="button"
                onClick={handleSpaceReindex}
                disabled={!spaceSelected}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reindex
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div className="col-span-1">
                {orgs && orgs.length > 0 ? (
                  <FormField
                    control={form.control}
                    name="organisation_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organisation</FormLabel>
                        <Select
                          onValueChange={(value) => handleOrgChange(value)}
                          defaultValue={orgId ? orgId.toString() : undefined}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Organisation" />
                          </SelectTrigger>
                          <SelectContent>
                            {orgs.map((item) => (
                              <SelectItem
                                key={item.id}
                                value={item.id.toString()}
                              >
                                {item.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                ) : null}

                {spaceOption && spaceOption.length > 0 ? (
                  <FormField
                    control={form.control}
                    name="space_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Space</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(parseInt(value, 10));
                            setSpaceSelected(true);
                          }}
                          value={field.value?.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Space" />
                          </SelectTrigger>
                          <SelectContent>
                            {spaceOption.map((item) => (
                              <SelectItem
                                key={item.id}
                                value={item.id.toString()}
                              >
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Reindex;
