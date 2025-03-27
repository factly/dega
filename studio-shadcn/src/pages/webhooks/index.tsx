import { useEffect, useState } from "react";
import WebhookList from "./components/WebhookList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getWebhooks } from "../../actions/webhooks";
import deepEqual from "deep-equal";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { useAppDispatch } from "@/hooks/reduxHooks";
import getUserPermission from "../../utils/getUserPermission";

// Define types for our state and props
interface WebhookFilters {
  page: number;
  limit: number;
}

interface Webhook {
  id: string;
  // Add other webhook properties as needed
}

interface WebhooksState {
  details: Record<string, Webhook>;
  loading: boolean;
  req: Array<{
    query: WebhookFilters;
    data: string[];
    total: number;
  }>;
}

interface RootState {
  webhooks: WebhooksState;
  spaces: any;
}

function Webhooks(): React.ReactElement {
  const spaces = useSelector(({ spaces }: RootState) => spaces);
  const actions = getUserPermission({
    resource: "webhooks",
    action: "get",
    spaces,
  });

  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState<WebhookFilters>({
    page: 1,
    limit: 20,
  });

  const { webhooks, total, loading } = useSelector((state: RootState) => {
    const node = state.webhooks.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        webhooks: node.data.map((element) => state.webhooks.details[element]),
        total: node.total,
        loading: state.webhooks.loading,
      };
    return { webhooks: [], total: 0, loading: state.webhooks.loading };
  });

  useEffect(() => {
    fetchWebhooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchWebhooks = (): void => {
    dispatch(getWebhooks(filters));
  };

  return loading ? (
    <Loader />
  ) : (
    <div className="flex flex-col space-y-4">
      <Helmet title={"Webhooks"} />
      <div className="flex justify-end">
        <Link to="/settings/advanced/webhooks/create">
          <Button variant="default">
            <Plus className="h-4 w-4" />
            New Webhook
          </Button>
        </Link>
      </div>

      <WebhookList
        actions={actions}
        data={{ webhooks, total, loading }}
        filters={filters}
        setFilters={setFilters}
        fetchWebhooks={fetchWebhooks}
      />
    </div>
  );
}

export default Webhooks;
