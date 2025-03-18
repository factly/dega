import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import deepEqual from "deep-equal";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Save } from "lucide-react";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { getEvents } from "../../../actions/events";
import { getEventName } from "../../../utils/event";

interface Event {
  id: string;
  name: string;
}

interface WebhookFormData {
  id?: string;
  name?: string;
  url?: string;
  enabled?: boolean;
  events?: string[];
  event_ids?: string[];
}

interface WebhookFormProps {
  onCreate: (values: WebhookFormData) => void;
  data?: WebhookFormData;
}

interface FiltersState {
  page: number;
  limit: number;
}

interface RootState {
  events: {
    req: Array<{
      query: FiltersState;
      data: string[];
    }>;
    details: Record<string, Event>;
  };
}

const WebhookForm: React.FC<WebhookFormProps> = ({ onCreate, data = {} }) => {
  const [valueChange, setValueChange] = useState(false);
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState<FiltersState>({
    page: 1,
    limit: 20,
  });

  const form = useForm<WebhookFormData>({
    defaultValues: { ...data },
  });

  const { events } = useSelector((state: RootState) => {
    let details: Event[] = [];
    let ids: string[] = [];

    for (let i = 1; i <= filters.page; i++) {
      let j = state.events.req.findIndex((item) =>
        deepEqual(item.query, { ...filters, page: i })
      );
      if (j > -1) {
        ids = ids.concat(state.events.req[j].data);
      }
    }
    details = ids.map((element) => state.events.details[element]);
    return { events: details };
  });

  const onReset = () => {
    form.reset();
    setValueChange(false);
  };

  const onSave = (values: WebhookFormData) => {
    values.event_ids = values.events || [];
    onCreate(values);
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchEvents = () => {
    dispatch(getEvents(filters));
  };

  if (!events) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              onSave(values);
              onReset();
            })}
            onChange={() => setValueChange(true)}
          >
            <div className="flex justify-end mb-4">
              <Button
                type="submit"
                disabled={!valueChange}
                className="flex gap-2 items-center"
              >
                <Save className="h-4 w-4" />
                {data && data.id ? "Update" : "Submit"}
              </Button>
            </div>

            <div className="max-w-md space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Enabled</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="events"
                render={() => (
                  <FormItem>
                    <FormLabel>Events</FormLabel>
                    <div className="grid grid-cols-3 gap-4">
                      {events.map((event) => (
                        <FormField
                          key={event.id}
                          control={form.control}
                          name="events"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={event.id}
                                className="flex flex-row items-start space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(event.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...(field.value || []),
                                            event.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== event.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {getEventName(event.name)}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex items-center mt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setFilters({
                      page: filters.page + 1,
                      limit: filters.limit,
                    });
                  }}
                >
                  Load More Events
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default WebhookForm;
