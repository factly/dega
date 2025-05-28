import { useEffect } from "react";
import WebhookEditForm from "./components/WebhookForm";
import { useSelector } from "react-redux";
import { updateWebhook, getWebhook } from "../../actions/webhooks";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { Helmet } from "react-helmet";
import Webhooklogs from "./webhooklogs";
import useNavigation from "../../utils/useNavigation";
import { useAppDispatch } from "@/hooks/reduxHooks";

// Define types for your Redux state and webhook data
interface Event {
  id: string;
  [key: string]: any;
}

interface Webhook {
  id: string;
  events: Event[] | string[];
  name?: string;
  url?: string;
  enabled?: boolean;
  [key: string]: any; // Add specific properties as needed
}

interface WebhookFormData {
  id?: string;
  name?: string;
  url?: string;
  enabled?: boolean;
  events?: string[];
  event_ids?: string[];
}

interface WebhooksState {
  details: {
    [id: string]: Webhook;
  };
  loading: boolean;
}

interface RootState {
  webhooks: WebhooksState;
}

function EditWebhook(): React.ReactElement {
  const history = useNavigation();
  const { id } = useParams<{ id: string }>();

  const dispatch = useAppDispatch();
  const { webhook, loading } = useSelector((state: RootState) => {
    return {
      webhook:
        id && state.webhooks.details[id] ? state.webhooks.details[id] : null,
      loading: state.webhooks.loading,
    };
  });

  useEffect(() => {
    if (id) {
      dispatch(getWebhook(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!webhook) {
    return <RecordNotFound />;
  }

  // Convert webhook to WebhookFormData format for the form component
  const webhookFormData: WebhookFormData = {
    id: webhook.id,
    name: webhook.name,
    url: webhook.url,
    enabled: webhook.enabled,
    events: Array.isArray(webhook.events)
      ? webhook.events.map((event) =>
          typeof event === "string" ? event : event.id
        )
      : (webhook.events as string[]),
  };

  const onUpdate = (values: WebhookFormData) => {
    // Make sure to preserve the webhook's original structure
    const updatedWebhook: Webhook = {
      ...webhook,
      name: values.name,
      url: values.url,
      enabled: values.enabled,
      events: values.events || [],
    };
    dispatch(updateWebhook(updatedWebhook));
    history(`/settings/advanced/webhooks/${id}/edit`);
  };

  return (
    <>
      <Helmet title={"Edit Webhook"} />
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <Card>
            <CardContent className="pt-6">
              <WebhookEditForm data={webhookFormData} onCreate={onUpdate} />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-4">
          <Card>
            <CardContent className="pt-6">
              <Webhooklogs WebhookId={webhook.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default EditWebhook;
