import React from 'react';
import WebhookList from './components/WebhookList';
import { Space, Button, Row } from 'antd';
import getUserPermission from '../../utils/getUserPermission';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getWebhooks } from '../../actions/webhooks';
import deepEqual from 'deep-equal';

function Webhooks() {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'webhooks', action: 'get', spaces });
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  const { webhooks, total, loading } = useSelector((state) => {
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

  React.useEffect(() => {
    fetchWebhooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchWebhooks = () => {
    dispatch(getWebhooks(filters));
  };

  return (
    <Space direction="vertical">
      <Row gutter={16} justify="end">
        <Link key="1" to="/advanced/webhooks/create">
          <Button type="primary">New Webhook</Button>
        </Link>
      </Row>

      <WebhookList
        actions={actions}
        data={{ webhooks, total, loading }}
        filters={filters}
        setFilters={setFilters}
        fetchWebhooks={fetchWebhooks}
      />
    </Space>
  );
}

export default Webhooks;
