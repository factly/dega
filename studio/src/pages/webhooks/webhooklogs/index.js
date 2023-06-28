import React from 'react';
import { Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import deepEqual from 'deep-equal';
import { getWebhooklogs } from '../../../actions/webhooklogs';
import WebhookLogsList from './components/WebhookLogsList';

function Webhooklogs({ WebhookId }) {
  const spaces = useSelector(({ spaces }) => spaces);
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  const { webhooklogs, total, loading } = useSelector((state) => {
    const node = state.webhooklogs.req.find((item) => {
      return deepEqual(item.query, filters);
    });
    if (node)
      return {
        webhooklogs: node.data.map((element) => state.webhooklogs.details[element]),
        total: node.total,
        loading: state.webhooks.loading,
      };
    return { webhooklogs: [], total: 0, loading: state.webhooklogs.loading };
  });
  React.useEffect(() => {
    fetchWebhooklogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchWebhooklogs = () => {
    dispatch(getWebhooklogs(WebhookId, filters));
  };

  return (
    <Space direction="vertical">
      <WebhookLogsList
        data={{ webhooklogs, total, loading }}
        filters={filters}
        setFilters={setFilters}
        fetchWebhooks={fetchWebhooklogs}
      />
    </Space>
  );
}

export default Webhooklogs;
