import React from "react";
import { Space } from "lucide-react";
import { useSelector } from "react-redux";
import deepEqual from "deep-equal";
import { getWebhooklogs } from "../../../actions/webhooklogs";
import WebhookLogsList from "./components/WebhookLogsList";
import { useAppDispatch } from "@/hooks/reduxHooks";

// Define interfaces for our component props and state
interface WebhooklogsProps {
  WebhookId: string;
}

interface FiltersState {
  page: number;
  limit: number;
}

interface WebhookLog {
  id: string;
  event: string;
  created_at: string;
  [key: string]: any; // Keep this to maintain backward compatibility
}

interface RootState {
  webhooklogs: {
    req: Array<{
      query: FiltersState;
      data: string[];
      total: number;
    }>;
    details: Record<string, WebhookLog>;
    loading: boolean;
  };
  webhooks: {
    loading: boolean;
  };
}

function Webhooklogs({ WebhookId }: WebhooklogsProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const [filters, setFilters] = React.useState<FiltersState>({
    page: 1,
    limit: 20,
  });

  const { webhooklogs, total, loading } = useSelector((state: RootState) => {
    const node = state.webhooklogs.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        webhooklogs: node.data.map(
          (element) => state.webhooklogs.details[element]
        ),
        total: node.total,
        loading: state.webhooks.loading,
      };

    return {
      webhooklogs: [] as WebhookLog[],
      total: 0,
      loading: state.webhooklogs.loading,
    };
  });

  React.useEffect(() => {
    fetchWebhooklogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchWebhooklogs = (): void => {
    dispatch(getWebhooklogs(WebhookId, filters));
  };

  // Create a handler that updates state in a way compatible with WebhookLogsList's expected type
  const handleFiltersChange = (partialFilters: Partial<FiltersState>): void => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...partialFilters,
    }));
  };

  return (
    <Space direction="vertical">
      <WebhookLogsList
        data={{ webhooklogs, total, loading }}
        filters={filters}
        setFilters={handleFiltersChange}
        fetchWebhooks={fetchWebhooklogs}
      />
    </Space>
  );
}

export default Webhooklogs;
