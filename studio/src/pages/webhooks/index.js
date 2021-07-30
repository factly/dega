import React from 'react';
import WebhookList from './components/WebhookList';
import { Space, Button, Row } from 'antd';
import { useSelector } from 'react-redux';
import getUserPermission from '../../utils/getUserPermission';
import { Link } from 'react-router-dom';

function Webhooks() {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'webhooks', action: 'get', spaces });
  return (
    <Space direction="vertical">
      <Row gutter={16} justify="end">
        <Link key="1" to="/webhooks/create">
          <Button type="primary">New Webhook</Button>
        </Link>
      </Row>

      <WebhookList actions={actions} />
    </Space>
  );
}

export default Webhooks;
