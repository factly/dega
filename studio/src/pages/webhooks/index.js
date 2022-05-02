import React from 'react';
import WebhookList from './components/WebhookList';
import { Space, Button, Row } from 'antd';
import { useSelector } from 'react-redux';
import getUserPermission from '../../utils/getUserPermission';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

function Webhooks() {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'webhooks', action: 'get', spaces });
  return (
    <Space direction="vertical">
      <Helmet title={'Webhooks'} />
      <Row gutter={16} justify="end">
        <Link key="1" to="/advanced/webhooks/create">
          <Button type="primary">New Webhook</Button>
        </Link>
      </Row>

      <WebhookList actions={actions} />
    </Space>
  );
}

export default Webhooks;
